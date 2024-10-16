import axios from "axios";
import * as cheerio from 'cheerio';
import { UUID } from "mongodb";
import { RecursiveCharacterTextSplitter, TextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { Builder, Browser, By, WebDriver} from "selenium-webdriver";
import { container } from "tsyringe";
import { ScrapeMetadata } from "../../../utils/interfaces/scrape-metadata";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { tryFindElement } from "src/shared/utils/helpers/webdriver-attempt";
import { OnlineResourceType } from "src/data/utils/constants/online-resource-type";
import { ScrapeEntry } from "../../../utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { XPostScrapeEntry } from "src/scraping/entries/online-resource/x/x-post";

export async function scrapeXPost(url: URL) : Promise<XPostScrapeEntry[]> {
    const driver = container.resolve<WebDriver>(DependencyInjectionToken.SeleniumWebDriver);
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
        new XPostScrapeEntry({
            id: new UUID().toString(),
            body: tweet,
            metadata: {
                type: OnlineResourceType.XPost,
                link: url.href,
                author
            }
        })
    ];
}
