import { UUID } from "mongodb";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { ScrapeEntryFailedError } from "src/error-handling/errors.js";
import { Builder, Browser, By, WebDriver} from "selenium-webdriver";
import { container } from "tsyringe";
import { ScrapeMetadata } from "../../../utils/interfaces/scrape-metadata";
import { DependencyInjectionToken } from "src/dependencies/utils/constants/dependency-injection-token";
import { tryFindElement } from "src/shared/utils/helpers/webdriver-attempt";
import { FindType } from "src/data/utils/constants/find-type";
import { ScrapeEntry } from "../../../utils/classes/scrape-entry";
import { env } from "src/shared/utils/constants/env";
import { MediaWebpageMetadata, MediaWebpageScrapeEntry } from "src/scraping/entries/hosted/media/media-webpage";
import { MediaScrapeMetadata } from "./utils/interfaces/media-scrape-metadata";
import { MediaType } from "./utils/constants/media-type";

export async function scrapeMediaWebpage(url: URL) {
    const driver = container.resolve<WebDriver>(DependencyInjectionToken.SeleniumWebDriver);
    const charMaxLimit = 30000; // Max webpage char limit.

    // Instantiate browser.
    await driver.get(url.toString());
    await driver.sleep(1000); // Hardcoded wait for page loading.

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
        new MediaWebpageScrapeEntry({
            id: new UUID().toString(),
            body: body,
            metadata: {
                type: FindType.MediaWebpage,
                mediaType: MediaType.Webpage,
                link: url.href,
                title
            }
        })
    ];
}
