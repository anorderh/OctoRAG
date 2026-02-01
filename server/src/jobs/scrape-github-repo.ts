import { Octokit } from '@octokit/rest';
import AdmZip from 'adm-zip';
import * as fs from 'fs';
import { UUID } from 'mongodb';
import path from 'path';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';
import { DependencyInjectionToken } from 'src/integrations/shared/constants/dependency-injection-token';
import {
    InvalidURLFormatError,
    ScrapeEntryFailedError,
} from 'src/shared/classes/errors.js';
import { env } from 'src/shared/constants/env';
import { downloadFile } from 'src/shared/utils/download-file';
import { container } from 'tsyringe';
import { GithubFileScrapeEntry } from './shared/classes/github-file';

export async function scrapeGithubRepo(
    url: URL,
): Promise<GithubFileScrapeEntry[]> {
    // Parse URL.
    let octokit = container.resolve<Octokit>(DependencyInjectionToken.Octokit);
    const maxGithubRepoSizeKb = 100000; // 100 MB in kilobytes
    let pathname = url.pathname;
    let parts = pathname.split('/').filter((p) => !!p);
    if (!url.href.includes('github.com') || parts.length != 2) {
        throw new InvalidURLFormatError();
    }

    // Download zip.
    let [owner, repo] = parts;
    let info = (await octokit.repos.get({ repo, owner })).data;
    if (info.size > maxGithubRepoSizeKb) {
        throw new ScrapeEntryFailedError({
            body: `Scrape for Github repo "${info.name}" failed due to passing the maximum allowed kB size.`,
        });
    }
    let resource = `https://github.com/${owner}/${repo}/zipball/master`;
    let zipUuid = new UUID().toString();
    let zipFilename = `${zipUuid}.zip`;
    fs.mkdirSync(env.pathes.temp, { recursive: true });
    let zipPath = `${env.pathes.temp}/${zipFilename}`;
    await downloadFile(resource, zipPath);

    // Process files into single body and delete zip.
    let zip = new AdmZip(zipPath);
    let results = [];
    for (let entry of zip.getEntries()) {
        if (!entry.isDirectory) {
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
        }
    }
    fs.unlinkSync(zipPath); // Delete file.

    return results;
}
