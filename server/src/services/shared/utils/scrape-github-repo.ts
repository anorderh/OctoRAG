import { Octokit } from '@octokit/rest';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import { UUID } from 'mongodb';
import path from 'path';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { MongoService } from 'src/services/mongo.service';
import {
    InvalidURLFormatError,
    ScrapeEntryFailedError,
} from 'src/shared/classes/errors.js';
import { DependencyInjectionToken } from 'src/shared/constants/dependency-injection-token';
import { env } from 'src/shared/constants/env';
import { downloadFile } from 'src/shared/utils/download-file';
import { container } from 'tsyringe';
import { GithubFileScrapeEntry } from '../classes/github-scrape-entry';

export async function scrapeGithubRepo(
    url: URL,
    mongo: MongoService,
    chat: RepoChat,
): Promise<GithubFileScrapeEntry[]> {
    const octokit = container.resolve<Octokit>(
        DependencyInjectionToken.Octokit,
    );
    const maxGithubRepoSizeKb = 100000; // 100 MB
    const maxFileSizeBytes = 500_000; // 500 KB per file

    const allowedExtensions = new Set([
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.cs',
        '.py',
        '.java',
        '.go',
        '.rs',
        '.json',
        '.md',
        '.txt',
        '.html',
        '.css',
        '.sql',
    ]);

    const ignoredDirectories = [
        'node_modules/',
        '.git/',
        'dist/',
        'build/',
        '.next/',
        'coverage/',
    ];

    const ignoredFilenames = new Set([
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
    ]);

    // Parse URL
    const pathname = url.pathname;
    mongo.submitLog(`Parsing pathname "${pathname}"...`, chat._id);

    const parts = pathname.split('/').filter(Boolean);
    if (!url.href.includes('github.com') || parts.length !== 2) {
        mongo.submitLog(`Pathname failed to be parsed.`, chat._id);
        throw new InvalidURLFormatError();
    }

    const [owner, repo] = parts;
    mongo.submitLog(`Pathname successfully parsed.`, chat._id);

    // Fetch repo info
    mongo.submitLog(`Reviewing Github repository details...`, chat._id);
    const info = (await octokit.repos.get({ repo, owner })).data;

    if (info.size > maxGithubRepoSizeKb) {
        throw new ScrapeEntryFailedError({
            body: `Scrape for Github repo "${info.name}" failed due to exceeding max size.`,
        });
    }

    mongo.submitLog(
        `Repo details:
Name: ${info.name}
Owner: ${info.owner.login}
Size: ${info.size}
Stars: ${info.stargazers_count}
Default Branch: ${info.default_branch}`,
        chat._id,
    );

    const resource = `https://github.com/${owner}/${repo}/zipball/${info.default_branch}`;
    const zipUuid = new UUID().toString();
    const zipPath = `${env.pathes.temp}/${zipUuid}.zip`;

    fs.mkdirSync(env.pathes.temp, { recursive: true });

    mongo.submitLog(`Downloading Github repository...`, chat._id);
    await downloadFile(resource, zipPath);
    mongo.submitLog(`Github repository downloaded`, chat._id);

    const results: GithubFileScrapeEntry[] = [];

    try {
        mongo.submitLog(`Processing Github repository's files...`, chat._id);
        const zip = new AdmZip(zipPath);

        for (const entry of zip.getEntries()) {
            if (entry.isDirectory) continue;
            const filename = entry.name;
            const baseName = path.basename(filename);
            if (ignoredFilenames.has(baseName)) continue;
            // Ignore unwanted directories
            if (ignoredDirectories.some((d) => filename.includes(d))) continue;
            const ext = path.extname(filename).toLowerCase();
            if (!allowedExtensions.has(ext)) continue;
            if (entry.header.size > maxFileSizeBytes) continue;

            const buffer = entry.getData();
            // crude binary detection
            if (buffer.includes(0)) continue;

            const body = buffer.toString('utf8').replace(/\r\n/g, '\n');
            mongo.submitLog(`Processed file "${filename}"`, chat._id);
            results.push(
                new GithubFileScrapeEntry(new UUID().toString(), {
                    filepath: entry.entryName,
                    text: body,
                    ext,
                    depth: filename.split('/').length,
                }),
            );
        }

        mongo.submitLog(`Processed all repository files.`, chat._id);
    } finally {
        mongo.submitLog(
            `Deleting Github repository zip from disk...`,
            chat._id,
        );
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }
        mongo.submitLog(`Zip deleted.`, chat._id);
    }

    return results;
}
