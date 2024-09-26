import { singleton, inject } from "tsyringe";
import { FindType } from '../utils/enums/find-type.js';
import { FailedGitRepoDownloadError, InvalidFindLinkFormatError, UnsupportedFindTypeError } from '../error-handling/errors.js';
import { Logger } from "pino";
import { InstanceDeps } from '../utils/enums/instance-deps.js';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import {YoutubeTranscript} from 'youtube-transcript';
import * as cheerio from 'cheerio';
import { env } from '../env.js';
import { decode } from "html-entities";
import * as fs from 'fs';
import { UUID } from "mongodb";
import yauzl from 'yauzl';
import { streamToString } from '../utils/extensions/stream-to-str.js';
import AdmZip from "adm-zip";
import { downloadFile } from '../utils/extensions/download-file.js';
import { ScrapeOptions } from '../utils/interfaces/scrape-options.js';
import { Board } from "src/data/collections/board.js";
import { Find } from "src/data/collections/board.js";
import { ScrapeResult } from "src/utils/interfaces/scrape-result.js";
import { ScrapeOption } from "src/scraping/models/scrape-option.js";
import { GithubRepoScrapeOption } from "src/scraping/options/github-repo.js";
import { WebpageScrapeOption } from "src/scraping/options/webpage.js";
import { YoutubeVideoScrapeOption } from "src/scraping/options/youtube-video.js";
import { Scrape } from "src/scraping/models/scrape.js";

@singleton()
export class ScrapeService {
    constructor(
        @inject(InstanceDeps.Logger) private logger: Logger
    ) {}

    public async scrape(find: Find): Promise<Scrape | null> {
        let scrape: Scrape = new Scrape(find);
        let currOption: ScrapeOption<any>;

        // Attempt scrape until all options depleted.
        while (scrape.options.length > 0) {
            try {
                currOption = scrape.options.shift();

                scrape.entries = await currOption.fetch(scrape.url);
                scrape.chunks = await currOption.chunk(scrape.entries);
                return scrape
            } catch (err: any) {
                this.logger.error(err);
            }
        }
        return null;
    }
}