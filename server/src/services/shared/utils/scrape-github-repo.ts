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
import { getFileUrl } from 'src/shared/utils/get-file-url';
import { container } from 'tsyringe';
import { GithubFileScrapeEntry } from '../classes/github-scrape-entry';
import { formatRepoSize } from './format-repo-size';
import { shouldIncludeFile } from './is-file-allowed';

export async function scrapeGithubRepo(
    url: URL,
    mongo: MongoService,
    chat: RepoChat,
): Promise<GithubFileScrapeEntry[]> {
    const octokitService = container.resolve(OctokitService);
    const maxGithubRepoSizeKb = 2000000;
    const maxFileSizeBytes = 500_000;

    try {
        const info = await octokitService.getRepoDetailsFromUrl(url, chat._id);
        if (info.size > maxGithubRepoSizeKb) {
            throw new ScrapeEntryFailedError({
                body: `Scrape for Github repo "${info.name}" failed due to exceeding max size.`,
            });
        }

        // Update status & size.
        await mongo.submitLog(
            `Repo details:
Name: ${info.name}
Owner: ${info.owner.login}
Size: ${formatRepoSize(info.size)}
Stars: ${info.stargazers_count}
Default Branch: ${info.default_branch}`,
            chat._id,
        );
        await mongo.updateStatus(chat._id, ChatStatus.SCRAPING_REPOSITORY);
        await mongo.collections.repoChat.updateOne(
            { _id: chat._id },
            {
                $set: {
                    repoSize: info.size,
                },
            },
        );

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
            await mongo.submitLog(
                `Processing Github repository's files...`,
                chat._id,
            );

            const zip = new AdmZip(zipPath);
            for (const entry of zip.getEntries()) {
                // Filter out files.
                if (entry.isDirectory) continue;
                const filename = entry.name;
                const ext = path.extname(filename).toLowerCase();
                if (!shouldIncludeFile(entry.entryName)) continue;
                if (entry.header.size > maxFileSizeBytes) continue;
                const buffer = entry.getData();
                const body = buffer.toString('utf8').replace(/\r\n/g, '\n');
                if (!body.trim()) continue;

                // Process into scrape entry.
                const fileUrl = getFileUrl(
                    info.owner.login,
                    info.name,
                    info.default_branch,
                    entry.entryName,
                );
                results.push(
                    new GithubFileScrapeEntry(new UUID().toString(), {
                        filepath: entry.entryName,
                        filename: filename,
                        repoUrl: info.url,
                        fileUrl: fileUrl,
                        defaultBranch: info.default_branch,
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
