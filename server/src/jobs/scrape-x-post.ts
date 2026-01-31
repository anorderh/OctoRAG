import { UUID } from 'mongodb';
import { By, WebDriver } from 'selenium-webdriver';
import { OnlineResourceType } from 'src/data/utils/constants/online-resource-type';
import { DependencyInjectionToken } from 'src/integrations/shared/constants/dependency-injection-token';
import { XPostScrapeEntry } from 'src/scraping/entries/online-resource/x/x-post';
import { ScrapeEntryFailedError } from 'src/shared/classes/errors.js';
import { tryFindElement } from 'src/shared/utils/webdriver-attempt';
import { container } from 'tsyringe';

export async function scrapeXPost(url: URL): Promise<XPostScrapeEntry[]> {
    const driver = container.resolve<WebDriver>(
        DependencyInjectionToken.SeleniumWebDriver,
    );
    // Instantiate browser.
    await driver.get(url.toString());

    // Grab elements.
    let articleElement = await tryFindElement({
        driver: driver,
        by: By.css('article'),
        wait: 5000,
    });
    if (articleElement == null) {
        throw new ScrapeEntryFailedError({
            body: 'Twitter Post scrape failed due to article element not being located.',
        });
    }
    let tweetElement = await tryFindElement({
        driver: driver,
        element: articleElement,
        by: By.css('[data-testid="tweetText"]'),
        wait: 5000,
    });
    if (tweetElement == null) {
        throw new ScrapeEntryFailedError({
            body: 'Twitter Post scrape failed due to tweet element not being located.',
        });
    }
    let authorElement = await tryFindElement({
        driver: driver,
        element: articleElement,
        by: By.css('[data-testid="User-Name"]'),
        wait: 5000,
    });
    if (authorElement == null) {
        throw new ScrapeEntryFailedError({
            body: `The Twitter Post scrape failed due to no author being parsed.`,
        });
    }

    // Validate elements' text.
    let [author, tweet] = [
        (await authorElement.getText()) ?? 'No author provided',
        await tweetElement.getText(),
    ].map((t) => t.replace('\n', ' ').trim());
    if (tweet.trim().length == 0) {
        throw new ScrapeEntryFailedError({
            body: `The Tweet Post scrape failed due to no valid body being parsed.`,
        });
    }

    return [
        new XPostScrapeEntry({
            id: new UUID().toString(),
            body: tweet,
            metadata: {
                type: OnlineResourceType.XPost,
                link: url.href,
                author,
            },
        }),
    ];
}
