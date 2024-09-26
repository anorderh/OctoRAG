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

export interface TwitterMetadata extends ScrapeMetadata {
    link: string,
    author: string
}

export const TwitterPostScrapeOption: ScrapeOption<TwitterMetadata> = {
    fetch: async (url: URL) => {
        const driver = container.resolve<WebDriver>(InstanceDeps.WebDriver);

        // Instantiate browser.
        await driver.get(url.toString());

        // Grab elements.
        let articleElement = await tryFindElement({
            driver: driver,
            by: By.css('article'),
            wait: 5000
        });
        if (articleElement == null) {
            throw new ScrapeEntryFailedError({
                body: "Twitter Post scrape failed due to article element not being located."
            })
        }
        let tweetElement = await tryFindElement({
            driver: driver,
            element: articleElement,
            by: By.css('[data-testid="tweetText"]'),
            wait: 5000
        });
        if (tweetElement == null) {
            throw new ScrapeEntryFailedError({
                body: "Twitter Post scrape failed due to tweet element not being located."
            })
        }
        let authorElement = await tryFindElement({
            driver: driver,
            element: articleElement,
            by: By.css('[data-testid="User-Name"]'),
            wait: 5000
        });
        if (authorElement == null) {
            throw new ScrapeEntryFailedError({
                body: `The Twitter Post scrape failed due to no author being parsed.`
            })
        }

        // Validate elements' text.
        let [author, tweet] = [
            (await authorElement.getText()) ?? "No author provided",
            await tweetElement.getText()
        ].map(t => t.replace("\n", " ").trim())
        if (tweet.trim().length == 0) {
            throw new ScrapeEntryFailedError({
                body: `The Tweet Post scrape failed due to no valid body being parsed.`
            })
        };

        return [
            {
                id: new UUID().toString(),
                body: tweet,
                metadata: {
                    type: FindType.TwitterPost,
                    link: url.href,
                    author
                }
            } as ScrapeEntry<TwitterMetadata>
        ];
    },
    chunk: async (entries: ScrapeEntry<TwitterMetadata>[]) => {
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
