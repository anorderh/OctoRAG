import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { InvalidFindLinkFormatError, ScrapeEntryFailedError } from "src/error-handling/errors";
import { downloadFile } from "src/utils/extensions/download-file";
import { env } from "src/env";
import AdmZip from "adm-zip";
import * as fs from 'fs';
import { RecursiveCharacterTextSplitter, RecursiveCharacterTextSplitterParams } from "langchain/text_splitter";
import { fileExtToTextSplitterLang } from "src/utils/extensions/file-ext-to-text-splitter-lang";
import { Document } from "@langchain/core/documents";
import path from "path";
import { InstanceDeps } from "src/utils/enums/instance-deps";
import { container } from "tsyringe";
import { Octokit } from "@octokit/rest";
import { FindType } from "src/utils/enums/find-type";
import { ScrapeOption } from "../models/scrape-option";
import { ScrapeEntry, ScrapeMetadata } from "../models/scrape-entry";

export interface GithubRepoMetadata extends ScrapeMetadata {
    repoName: string;
    desc?: string;
    owner?: string;
    filename: string;
    ext?: string;
}

export const GithubRepoScrapeOption: ScrapeOption<GithubRepoMetadata> = {
    fetch: async (url: URL) => {
        // Parse URL.
        let octokit = container.resolve<Octokit>(InstanceDeps.Octokit);
        const maxGithubRepoSizeKb = 100000; // 100 MB in kilobytes
        let pathname = url.pathname;
        let parts = pathname.split("/").filter(p => !!p);
        if (
            !url.href.includes("github.com")
            || parts.length != 2
        ) {
            throw new InvalidFindLinkFormatError();
        }

        // Download zip.
        let [owner, repo] = parts;
        let info = (await octokit.repos.get({repo, owner})).data;
        if (info.size > maxGithubRepoSizeKb) {
            throw new ScrapeEntryFailedError({
                body: `Scrape for Github repo "${info.name}" failed due to passing the maximum allowed kB size.`
            })
        }
        let resource = `https://github.com/${owner}/${repo}/zipball/master`;
        let zipUuid = new UUID().toString();
        let zipFilename = `${zipUuid}.zip`;
        fs.mkdirSync(env.pathes.temp, { recursive: true });
        let zipPath = `${env.pathes.temp}/${zipFilename}`;
        await downloadFile(resource, zipPath);

        // Process files into single body and delete zip.
        let zip = new AdmZip(zipPath);
        let results = []
        for(let entry of zip.getEntries()) {
            if (!entry.isDirectory) {
                results.push({
                    body: entry.getData().toString('utf8'),
                    metadata: {
                        type: FindType.GithubRepo,
                        repoName: info.name,
                        desc: info.description,
                        owner: info.owner.name,
                        filename: entry.name,
                        ext: path.extname(entry.name)
                    }
                } as ScrapeEntry<GithubRepoMetadata>)
            }
        }
        fs.unlinkSync(zipPath); // Delete file.

        return results;
    },
    chunk: async (entries: ScrapeEntry<GithubRepoMetadata>[]) => {
        let chunks : Document<Record<string, any>>[] = [];
        // Iterate through scrape entries.
        for (let e of entries) {
            let params = {
                chunkSize: env.defaults.chunking.chunkSize,
                chunkOverlap: env.defaults.chunking.chunkOverlap
            } as RecursiveCharacterTextSplitterParams;

            // If language detected, use code splitter. Else character splitter.
            let lang = fileExtToTextSplitterLang[e.metadata.ext]
            let splitter: RecursiveCharacterTextSplitter = !!lang
                ? RecursiveCharacterTextSplitter.fromLanguage(lang, params)
                : new RecursiveCharacterTextSplitter(params)

            let docs: Document[] = [];
            for (let text of (await splitter.splitText(e.body))) {
                docs.push(
                    new Document({
                        id: new UUID().toString(),
                        pageContent: text,
                        metadata: e.metadata
                    })
                )
            }
            chunks.concat(docs);
        }

        return chunks;
    }
}