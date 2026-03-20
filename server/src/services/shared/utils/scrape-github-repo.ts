import AdmZip from 'adm-zip';
import * as fs from 'fs';
import { UUID } from 'mongodb';
import path from 'path';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { ChatStatus } from 'src/database/shared/constants/chat-status.enum.js';
import { MongoService } from 'src/services/mongo.service';
import { OctokitService } from 'src/services/octokit.service';
import { ScrapeEntryFailedError } from 'src/shared/classes/errors.js';
import { env } from 'src/shared/constants/env';
import { downloadFile } from 'src/shared/utils/download-file';
import { container } from 'tsyringe';
import { GithubFileScrapeEntry } from '../classes/github-scrape-entry';

export async function scrapeGithubRepo(
    url: URL,
    mongo: MongoService,
    chat: RepoChat,
): Promise<GithubFileScrapeEntry[]> {
    const octokitService = container.resolve(OctokitService);

    const maxGithubRepoSizeKb = 100000;
    const maxFileSizeBytes = 500_000;

    const CODE_EXTENSIONS = new Set([
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.c',
        '.cc',
        '.cpp',
        '.h',
        '.hpp',
        '.cs',
        '.py',
        '.java',
        '.go',
        '.rs',
        '.json',
        '.md',
        '.html',
        '.css',
        '.sql',
        '.yaml',
        '.yml',
        '.sh',
    ]);

    const EXCLUDED_EXTENSIONS = new Set([
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.svg',
        '.ico',
        '.zip',
        '.tar',
        '.gz',
        '.exe',
        '.dll',
        '.so',
        '.lock',
    ]);

    const IGNORED_DIRECTORIES = [
        'node_modules/',
        '.git/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
        '.idea/',
        '.vscode/',
        'cmake-build/',
        'CMakeFiles/',
    ];

    const IGNORED_FILENAMES = new Set([
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'CMakeCache.txt',
    ]);

    try {
        const info = await octokitService.getRepoDetailsFromUrl(url, chat._id);
        if (info.size > maxGithubRepoSizeKb) {
            throw new ScrapeEntryFailedError({
                body: `Scrape for Github repo "${info.name}" failed due to exceeding max size.`,
            });
        }

        await mongo.updateStatus(chat._id, ChatStatus.SCRAPING_REPOSITORY);

        const pathname = url.pathname;
        const parts = pathname.split('/').filter(Boolean);
        const [owner, repo] = parts;
        const resource = `https://github.com/${owner}/${repo}/zipball/${info.default_branch}`;
        const zipUuid = new UUID().toString();
        const zipPath = `${env.pathes.temp}/${zipUuid}.zip`;

        fs.mkdirSync(env.pathes.temp, { recursive: true });

        await mongo.submitLog(`Downloading Github repository...`, chat._id);
        await downloadFile(resource, zipPath);
        await mongo.submitLog(`Github repository downloaded`, chat._id);

        const results: GithubFileScrapeEntry[] = [];

        try {
            // ✅ CHUNKING
            await mongo.updateStatus(chat._id, ChatStatus.CHUNKING_FILES);

            await mongo.submitLog(
                `Processing Github repository's files...`,
                chat._id,
            );

            const zip = new AdmZip(zipPath);

            for (const entry of zip.getEntries()) {
                if (entry.isDirectory) continue;

                const filename = entry.name;
                const baseName = path.basename(filename);
                const ext = path.extname(filename).toLowerCase();

                if (IGNORED_FILENAMES.has(baseName)) continue;
                if (IGNORED_DIRECTORIES.some((d) => filename.includes(d)))
                    continue;
                if (EXCLUDED_EXTENSIONS.has(ext)) continue;
                // Only include if it's a known text/code file
                if (!CODE_EXTENSIONS.has(ext)) continue;

                if (entry.header.size > maxFileSizeBytes) continue;

                const buffer = entry.getData();
                const body = buffer.toString('utf8').replace(/\r\n/g, '\n');
                if (!body.trim()) continue;

                results.push(
                    new GithubFileScrapeEntry(new UUID().toString(), {
                        filepath: entry.entryName,
                        filename: filename,
                        repoName: info.name,
                        text: body,
                        ext,
                        depth: filename.split('/').length,
                    }),
                );
            }

            await mongo.submitLog(`Processed all repository files.`, chat._id);
        } finally {
            await mongo.submitLog(
                `Deleting Github repository zip from disk...`,
                chat._id,
            );

            if (fs.existsSync(zipPath)) {
                fs.unlinkSync(zipPath);
            }

            await mongo.submitLog(`Zip deleted.`, chat._id);
        }

        return results;
    } catch (err) {
        // ✅ ERROR STATE
        await mongo.updateStatus(chat._id, ChatStatus.ERROR);

        await mongo.submitLog(
            `Scrape failed: ${
                err instanceof Error ? err.message : 'Unknown error'
            }`,
            chat._id,
        );

        throw err;
    }
}
