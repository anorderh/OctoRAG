import { Browser, Builder, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";
import { container } from "tsyringe";
import { DependencyInjectionToken } from "../utils/constants/dependency-injection-token";
import { env } from "src/shared/utils/constants/env";
import { instantiate } from "../utils/extensions/instantiate";

export const SetupSelenium = instantiate(
    DependencyInjectionToken.SeleniumWebDriver,
    async function() {
        let options = new Options();
        options.addArguments("--headless=new")
        container.registerInstance<WebDriver>(
            DependencyInjectionToken.SeleniumWebDriver,
            await new Builder()
                .forBrowser(Browser.CHROME)
                .setChromeOptions(options)
                .build()
        )
    }
)