import { Octokit } from '@octokit/rest';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import { UUID } from 'mongodb';
import path from 'path';
import { RepoChat } from 'src/database/entities/repo-chat/repo-chat';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';
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
    // Parse URL.
    let octokit = container.resolve<Octokit>(DependencyInjectionToken.Octokit);
    const maxGithubRepoSizeKb = 100000; // 100 MB in kilobytes
    let pathname = url.pathname;
    mongo.submitLog(`Parsing pathname "${pathname}"...`, chat._id);
    let parts = pathname.split('/').filter((p) => !!p);
    if (!url.href.includes('github.com') || parts.length != 2) {
        mongo.submitLog(`Pathname failed to be parsed.`, chat._id);
        throw new InvalidURLFormatError();
    }
    mongo.submitLog(`Pathname successfully parsed.`, chat._id);

    // Download zip.
    mongo.submitLog(`Reviewing Github repository details...`, chat._id);
    let [owner, repo] = parts;
    let info = (await octokit.repos.get({ repo, owner })).data;
    if (info.size > maxGithubRepoSizeKb) {
        mongo.submitLog(
            `Github repository's size exceeds the allowed limit: ${maxGithubRepoSizeKb} Kb.`,
            chat._id,
        );
        throw new ScrapeEntryFailedError({
            body: `Scrape for Github repo "${info.name}" failed due to passing the maximum allowed kB size.`,
        });
    }
    mongo.submitLog(
        `Github repository's size is within the allowed limit: ${maxGithubRepoSizeKb} Kb`,
        chat._id,
    );
    mongo.submitLog(
        `Github repository details:\nName: ${info.name}\nOwner: ${info.owner}\nSize: ${info.size}\nStars: ${info.stargazers_count}`,
        chat._id,
    );
    let resource = `https://github.com/${owner}/${repo}/zipball/master`;
    let zipUuid = new UUID().toString();
    let zipFilename = `${zipUuid}.zip`;
    fs.mkdirSync(env.pathes.temp, { recursive: true });
    let zipPath = `${env.pathes.temp}/${zipFilename}`;
    mongo.submitLog(`Downloading Github repository...`, chat._id);
    await downloadFile(resource, zipPath);
    mongo.submitLog(`Github repository downloaded`, chat._id);

    // Process files into single body and delete zip.
    mongo.submitLog(`Processing Github repository's files...`, chat._id);
    let zip = new AdmZip(zipPath);
    let results = [];
    for (let entry of zip.getEntries()) {
        if (!entry.isDirectory) {
            mongo.submitLog(`Processing file "${entry.name}"...`, chat._id);
            results.push(
                new GithubFileScrapeEntry({
                    id: new UUID().toString(),
                    body: entry.getData().toString('utf8'),
                    metadata: {
                        type: OnlineResourceType.GithubRepo,
                        repoName: info.name,
                        desc: info.description,
                        owner: info.owner.name,
                        filename: entry.name,
                        ext: path.extname(entry.name),
                    },
                }),
            );
            mongo.submitLog(`Processed file "${entry.name}".`, chat._id);
        }
    }
    mongo.submitLog(`Processed all of Github repository's files.`, chat._id);
    mongo.submitLog(`Deleting Github repository .zip from disk`, chat._id);
    fs.unlinkSync(zipPath); // Delete file.
    mongo.submitLog(`Github repository deleted.`, chat._id);

    return results;
}
