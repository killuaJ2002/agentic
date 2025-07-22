import { chromium } from "playwright";

const fillBookingForm = async ({ from, to, date }) => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Set up timeout to ensure browser closes after 3 seconds
  const timeoutId = setTimeout(async () => {
    console.log("Timeout reached - closing browser");
    await browser.close();
  }, 3000);

  try {
    await page.goto("http://127.0.0.1:5500/index.html");

    await page.fill("#fromInput", from);
    await page.fill("#toInput", to);
    await page.fill("#dateInput", date);

    await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/data") && res.status() === 201
      ),
      page.click('button[type="submit"]'),
    ]);
  } catch (error) {
    console.log("Error occurred:", error.message);
  } finally {
    // Clear the timeout and close browser
    clearTimeout(timeoutId);

    // Double-check that browser is closed
    if (browser.isConnected()) {
      await browser.close();
    }
  }
};

export { fillBookingForm };
