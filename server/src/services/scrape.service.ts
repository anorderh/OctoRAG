import { singleton, inject } from "tsyringe";
import { FindType } from '../utils/enums/find-type';
import { FailedGitRepoDownloadError, InvalidFindLinkFormatError, UnsupportedFindTypeError } from '../error-handling/errors';
import { Logger } from "pino";
import { InstanceDeps } from '../utils/enums/instance-deps';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {YoutubeTranscript} from 'youtube-transcript';
import * as cheerio from 'cheerio';
import { env } from '../env';
import { decode } from "html-entities";
import * as fs from 'fs';
import { UUID } from "mongodb";
import yauzl from 'yauzl';
import { streamToString } from '../utils/extensions/stream-to-str';
import AdmZip from "adm-zip";
import { downloadFile } from '../utils/extensions/download-file';
import { ScrapeProcessingFunction } from '../utils/types/scrape-processing-func';
import { ScrapeOptions } from '../utils/interfaces/scrape-options';
import { Board, Find } from "src/data/collections";
import { Url } from "url";
import { ScrapeResult } from "src/utils/interfaces/scrape-result";

@singleton()
export class ScrapeService {
    scrapes: {[key: string]: ScrapeProcessingFunction} = {
        [FindType.HTML]: this.scrapeHtml,
        [FindType.GithubRepo]: this.scrapeGithubRepo,
        [FindType.YoutubeVideo]: this.scrapeYoutubeTranscript,
        [FindType.Other]: this.scrapeHtml
    }

    constructor(
        @inject(InstanceDeps.Logger) private logger: Logger
    ) {
        Object.entries(this.scrapes).forEach(([key, val]) => {
            this.scrapes[key] = val.bind(this); // Class binding, to ensure helpers can be referenced.
        })
        fs.mkdirSync(env.pathes.temp, { recursive: true }); // Ensure 'temp' dir is created.
    }

    public async scrape(find: Find) : Promise<ScrapeResult[]> {
        // Grab find's scraping method. If not mapped, default to html.
        let func : ScrapeProcessingFunction = this.scrapes[find.type] ?? this.scrapeHtml.bind(this);

        // Attempt scrape.
        let options = {
            type: find.type,
            link: find.link,
            url: new URL(find.link)
        } as ScrapeOptions
        let res;
        try {
            this.logger.info(`Processing link "${options.link}" for type "${options.type}".`)
            res = await func(options);
        } catch (err: any) {
            this.logger.error(err);

            // If non-HTML scrape was attempted, try to process HTML.
            if (func != this.scrapeHtml) {
                this.logger.info(`Default to HTML processing...`);
                res = await this.scrapeHtml(options);
            } else {
                throw err; // Else propagate error.
            }
        }

        this.logger.info(res); // DEBUG.
        return res;
    }

    public async scrapeBoard(board: Board) {
        
    }

    private async scrapeHtml(options: ScrapeOptions) :  Promise<ScrapeResult[]> {
        const res = await axios.get(options.url.href); 
        const $ = cheerio.load(res.data);
        const textContent = $('body').text().replace(/\s\s+/g, ' ');
        return [{
            doi: new UUID().toString(),
            source: options.link,
            text: textContent
        }]
    }

    private async scrapeGithubRepo(options: ScrapeOptions) : Promise<ScrapeResult[]> {
        // Parse URL.
        let path = options.url.pathname;
        let parts = path.split("/").filter(p => !!p);
        if (
            !options.url.href.includes("github.com")
            || parts.length != 2
        ) {
            throw new InvalidFindLinkFormatError();
        }

        // Download zip.
        let [owner, repo] = parts;
        let resource = `https://github.com/${owner}/${repo}/zipball/master`;
        let zipUuid = new UUID().toString();
        let zipFilename = `${zipUuid}.zip`;
        let zipPath = `${env.pathes.temp}/${zipFilename}`;
        await downloadFile(resource, zipPath);

        // Process files into single body and delete zip.
        let zip = new AdmZip(zipPath);
        let results = []
        for(let entry of zip.getEntries()) {
            if (!entry.isDirectory) {
                results.push({
                    doi: new UUID().toString(),
                    source: options.link,
                    subgroup: entry.entryName,
                    text: entry.getData().toString('utf8')
                } as ScrapeResult)
            }
        }
        fs.unlinkSync(zipPath); // Delete file.
        return results;
    }

    private async scrapeYoutubeTranscript(options: ScrapeOptions) : Promise<ScrapeResult[]> {
        let url = options.url;
        let videoId = url.searchParams.get('v')
        if (
            !options.url.href.includes("youtube.com/watch")
            || videoId == null
        ) {
            throw new InvalidFindLinkFormatError();
        }
        let transcripts = await YoutubeTranscript.fetchTranscript(videoId);
        let raw = transcripts
            .map(t => decode(decode(t.text))) // Output from `youtube-transcript` node package is doubly HTML encoded.
            .join(" ");
        return [{
            doi: new UUID().toString(),
            source: options.link,
            text: raw
        }]
    }  
}