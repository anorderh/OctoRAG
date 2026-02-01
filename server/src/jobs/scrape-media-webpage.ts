import { UUID } from 'mongodb';
import { By, WebDriver } from 'selenium-webdriver';
import { OnlineResourceType } from 'src/database/shared/constants/online-resource-type';
import { DependencyInjectionToken } from 'src/integrations/shared/constants/dependency-injection-token';
import { ScrapeEntryFailedError } from 'src/shared/classes/errors.js';
import { tryFindElement } from 'src/shared/utils/webdriver-attempt';
import { container } from 'tsyringe';
import { MediaWebpageScrapeEntry } from './shared/classes/media-webpage';
import { MediaType } from './shared/constants/media-type';

export async function scrapeMediaWebpage(url: URL) {
    const driver = container.resolve<WebDriver>(
        DependencyInjectionToken.SeleniumWebDriver,
    );
    const charMaxLimit = 30000; // Max webpage char limit.

    // Instantiate browser.
    await driver.get(url.toString());
    await driver.sleep(1000); // Hardcoded wait for page loading.

    // Grab elements' text.
    let titleElement = await tryFindElement({
        driver,
        by: By.css('title'),
    });
    let title = titleElement
        ? await titleElement.getText()
        : 'No title provided';
    let bodyElement = await tryFindElement({
        driver,
        by: By.css('body'),
    });
    let body = bodyElement
        ? (await bodyElement.getText()).replace(/\s\s+/g, ' ')
        : '';

    // Validate parsing.
    if (body.trim().length == 0) {
        throw new ScrapeEntryFailedError({
            body: `The webpage scrape for "${url.href}" is prohibited due to no valid body being parsed.`,
        });
    } else if (body.length > charMaxLimit) {
        throw new ScrapeEntryFailedError({
            body: `The webpage scrape for "${url.href}" is prohibited due to passing the maximum character limit allowed.`,
        });
    }

    return [
        new MediaWebpageScrapeEntry({
            id: new UUID().toString(),
            body: body,
            metadata: {
                type: OnlineResourceType.MediaWebpage,
                mediaType: MediaType.Webpage,
                link: url.href,
                title,
            },
        }),
    ];
}
