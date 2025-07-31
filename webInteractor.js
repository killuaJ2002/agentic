import { chromium } from "playwright";

const bookTicket = async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("https://www.makemytrip.com/", {
      waitUntil: "domcontentloaded",
    });

    // close popups if appear
    const closeBtn = page.locator(".commonModal__close");
    if (await closeBtn.isVisible({ timeout: 5000 })) {
      await closeBtn.click();
      console.log("Closed popup");
    } else {
      console.log("No popup appeared");
    }

    // Selecting flight tab
    await page.locator('li[data-cy="menu_Flights"]').click();
    // Selecting one way trip
    await page.locator('li[data-cy="oneWayTrip"]').click();
    // Selecting From city
    await page.locator('label[for="fromCity"]').click();
    await page.locator('input[placeholder="From"]').fill("Silchar");
    // waiting for suggestion list to appear
    await page.waitForSelector(".react-autosuggest__suggestions-list");
    // select the first li
    await page
      .locator(".react-autosuggest__suggestions-list li")
      .first()
      .click();
  } catch (error) {
    console.log(error);
  } finally {
    await page.waitForTimeout(3000); // Wait 3 sec visibly
    await browser.close();
  }
};

bookTicket();
