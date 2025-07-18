import { chromium } from "playwright";

const fillBookingForm = async ({ from, to, date }) => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

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

  await browser.close();
};

export { fillBookingForm };
