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
import { ScrapeOptions } from '../utils/interfaces/scrape-options';
import { Board, Find } from "src/data/collections";
import { ScrapeResult } from "src/utils/interfaces/scrape-result";
import { ScrapeOption } from "src/scraping/models/scrape-option";
import { GithubRepoScrapeOption } from "src/scraping/options/github-repo";
import { WebpageScrapeOption } from "src/scraping/options/webpage";
import { YoutubeVideoScrapeOption } from "src/scraping/options/youtube-video";
import { Scrape } from "src/scraping/models/scrape";

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