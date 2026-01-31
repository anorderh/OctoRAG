import { Browser, Builder, WebDriver } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome.js';
import { container } from 'tsyringe';
import { DependencyInjectionToken } from './shared/constants/dependency-injection-token';
import { instantiate } from './shared/extensions/instantiate';

export const SetupSelenium = instantiate(
    DependencyInjectionToken.SeleniumWebDriver,
    async function () {
        let options = new Options();
        options.addArguments('--headless=new');
        container.registerInstance<WebDriver>(
            DependencyInjectionToken.SeleniumWebDriver,
            await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(options)
                .build(),
        );
    },
);
