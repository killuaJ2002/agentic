import { chromium } from "playwright";

const bookTicket = async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.makemytrip.com/");
    const closeBtn = page.locator(".commonModal__close");
    await closeBtn.waitFor({ state: "visible", timeout: 3000 });
    await closeBtn.click();
    await page.locator(".searchCity").click();
    const fromInput = page.locator("input[placeholder='From']");
    await fromInput.fill("Dehradun");

    await page.waitForSelector("ul[role='listbox'] li[role='option']"); // Wait for suggestions
    await page.locator("ul[role='listbox'] li[role='option']").first().click();
  } catch (error) {
    console.log(error);
  } finally {
    setTimeout(async () => {
      await browser.close();
    }, 3000);
  }
};

bookTicket();
