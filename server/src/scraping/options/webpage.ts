import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { ScrapeResult } from "src/utils/interfaces/scrape-result.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { env } from "src/env.js";
import { limitStringLength } from "src/utils/extensions/limit-str-length.js";
import { Document } from "@langchain/core/documents";
import { FindType } from "src/utils/enums/find-type.js";
import { ScrapeOption } from "../models/scrape-option.js";
import { ScrapeEntry, ScrapeMetadata } from "../models/scrape-entry.js";
import { ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { Builder, Browser, By, WebDriver} from "selenium-webdriver";
import { InstanceDeps } from "src/utils/enums/instance-deps.js";
import { container } from "tsyringe";
import { tryFindElement } from "src/utils/extensions/webdriver-attempt.js";

export interface WebpageMetadata extends ScrapeMetadata {
    link: string,
    title: string,
}

export const WebpageScrapeOption: ScrapeOption<WebpageMetadata> = {
    fetch: async (url: URL) => {
        const driver = container.resolve<WebDriver>(InstanceDeps.WebDriver);
        const charMaxLimit = 30000; // Max webpage char limit.

        // Instantiate browser.
        await driver.get(url.toString());
        await driver.sleep(3000); // Hardcoded wait for page loading.

        // Grab elements' text.
        let titleElement = await tryFindElement({
            driver,
            by: By.css('title')
        });
        let title = titleElement
            ? await titleElement.getText()
            : "No title provided";
        let bodyElement = await tryFindElement({
            driver,
            by: By.css('body')
        });
        let body = bodyElement
            ? (await bodyElement.getText()).replace(/\s\s+/g, ' ')
            : "";

        // Validate parsing.
        if (body.trim().length == 0) {
            throw new ScrapeEntryFailedError({
                body: `The webpage scrape for "${url.href}" is prohibited due to no valid body being parsed.`
            })
        } else if (body.length > charMaxLimit) {
            throw new ScrapeEntryFailedError({
                body: `The webpage scrape for "${url.href}" is prohibited due to passing the maximum character limit allowed.`
            })
        }

        return [
            {
                id: new UUID().toString(),
                body: body,
                metadata: {
                    type: FindType.Webpage,
                    link: url.href,
                    title
                }
            } as ScrapeEntry<WebpageMetadata>
        ];
    },
    chunk: async (entries: ScrapeEntry<WebpageMetadata>[]) => {
        let splitter = new RecursiveCharacterTextSplitter({
            chunkSize: env.defaults.chunking.chunkSize,
            chunkOverlap: env.defaults.chunking.chunkOverlap
        });

        let entry = entries[0];
        let docs: Document[] = []
        for (let text of (await splitter.splitText(entry.body))) {
            docs.push(
                new Document({
                    id: new UUID().toString(),
                    pageContent: text,
                    metadata: entry.metadata
                })
            )
        }
        return docs;
    }
}
