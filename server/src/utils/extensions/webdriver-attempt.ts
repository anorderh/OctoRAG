import { By, WebDriver, WebElement, error, until} from "selenium-webdriver";

export interface TryFindElementParams {
    driver: WebDriver,
    element?: WebElement,
    by: By,
    wait?: number
}

export async function tryFindElement({
    driver, 
    element, 
    by, 
    wait
}: TryFindElementParams) : Promise<WebElement | null> {
    try {
        let res;
        if (!wait) {
            res = !!element
                ? await element.findElement(by)
                : await driver.findElement(by);
        } else {
            res = await driver.wait(
                !!element
                    ? async () => {
                        const child = await element.findElement(by);
                        return child.isDisplayed() ? child : null;
                    }
                    : until.elementLocated(by), 
            wait);
        }
        return res;
    } catch (err) {
        if (
            err instanceof error.NoSuchElementError
            || err instanceof error.TimeoutError
        ) {
            return null
        }
        throw err;
    }
}