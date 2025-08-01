import { chromium } from "playwright";

// Function to handle date selection
async function selectDateOnCalendar(page, targetDate) {
  // Validate date is in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (targetDate < today) {
    throw new Error("Target date must be in the future");
  }

  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();
  const targetDay = targetDate.getDate();

  // Get current displayed months from calendar (handles dual month display)
  let attempts = 0;
  const maxAttempts = 24; // Prevent infinite loop (2 years max)

  while (attempts < maxAttempts) {
    try {
      // Get both month captions (website shows 2 months side by side)
      const captions = await page.locator(".DayPicker-Caption").all();
      let foundTargetMonth = false;

      for (let caption of captions) {
        const monthYearText = await caption.textContent();
        const [currentMonthName, currentYear] = monthYearText.trim().split(" ");

        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const currentMonth = monthNames.indexOf(currentMonthName);
        const currentYearNum = parseInt(currentYear);

        // Check if target month/year is visible in either of the displayed months
        if (currentYearNum === targetYear && currentMonth === targetMonth) {
          foundTargetMonth = true;
          break;
        }
      }

      if (foundTargetMonth) {
        break;
      }

      // Get the first (left) month for navigation logic
      const firstMonthText = await page
        .locator(".DayPicker-Caption")
        .first()
        .textContent();
      const [firstMonthName, firstYear] = firstMonthText.trim().split(" ");

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const firstMonth = monthNames.indexOf(firstMonthName);
      const firstYearNum = parseInt(firstYear);

      // Navigate based on the first displayed month
      if (
        firstYearNum < targetYear ||
        (firstYearNum === targetYear && firstMonth < targetMonth)
      ) {
        await page.locator(".DayPicker-NavButton--next").click();
      } else {
        await page.locator(".DayPicker-NavButton--prev").click();
      }

      await page.waitForTimeout(500); // Wait for navigation
      attempts++;
    } catch (e) {
      console.log("Error navigating calendar:", e);
      break;
    }
  }

  // Try multiple selectors to find and click the target date (month-specific)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const targetMonthName = monthNames[targetMonth];

  const selectors = [
    // Most specific: exact date attribute
    `[data-date="${targetYear}-${(targetMonth + 1)
      .toString()
      .padStart(2, "0")}-${targetDay.toString().padStart(2, "0")}"]`,

    // Aria-label with full date
    `.DayPicker-Day[aria-label*="${targetDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })}"]`,

    // Aria-label containing month name and day
    `.DayPicker-Day[aria-label*="${targetMonthName}"][aria-label*="${targetDay}"]`,

    // Aria-label containing short month and day
    `.DayPicker-Day[aria-label*="${targetMonthName.substring(
      0,
      3
    )}"][aria-label*="${targetDay}"]`,
  ];

  let dateSelected = false;
  for (const selector of selectors) {
    try {
      const dateElements = await page.locator(selector).all();
      for (let dateElement of dateElements) {
        if (
          (await dateElement.isVisible()) &&
          !(await dateElement.getAttribute("class")).includes(
            "DayPicker-Day--disabled"
          )
        ) {
          await dateElement.click();
          dateSelected = true;
          console.log(`Selected date using selector: ${selector}`);
          break;
        }
      }
      if (dateSelected) break;
    } catch (e) {
      continue;
    }
  }

  // Enhanced fallback: Find date within the correct month container
  if (!dateSelected) {
    try {
      // Find the correct month container first
      const monthContainers = await page.locator(".DayPicker-Month").all();

      for (let container of monthContainers) {
        const monthCaption = await container
          .locator(".DayPicker-Caption")
          .textContent();
        if (
          monthCaption.includes(targetMonthName) &&
          monthCaption.includes(targetYear.toString())
        ) {
          // Look for the target day within this specific month container
          const dayElements = await container
            .locator(
              `.DayPicker-Day:not(.DayPicker-Day--disabled):not(.DayPicker-Day--outside)`
            )
            .all();

          for (let dayElement of dayElements) {
            const dayText = await dayElement.textContent();
            if (dayText.trim() === targetDay.toString()) {
              await dayElement.click();
              dateSelected = true;
              console.log(`Selected date using month container approach`);
              break;
            }
          }
          if (dateSelected) break;
        }
      }
    } catch (e) {
      console.log("Month container fallback failed:", e);
    }
  }

  if (!dateSelected) {
    // Final fallback removed - enhanced month container approach above should handle this
    throw new Error(`Could not select date: ${targetDate.toDateString()}`);
  }

  console.log(`Successfully selected date: ${targetDate.toDateString()}`);
}

// Function to book the ticket
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
    await page.locator('input[placeholder="From"]').fill("jaipur");
    // waiting for suggestion list to appear
    await page.waitForSelector(".react-autosuggest__suggestions-list");
    // select the first li
    await page
      .locator(".react-autosuggest__suggestions-list li")
      .first()
      .click();

    // Selecting To city
    await page.locator('label[for="toCity"]').click();
    await page.locator('input[placeholder="To"]').fill("goa");
    page.waitForSelector(".react-autosuggest__suggestions-list");
    await page
      .locator(".react-autosuggest__suggestions-list li")
      .first()
      .click();

    // Selecting departure date
    await page.locator('label[for="departure"]').click({ force: true });

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 35);

    await selectDateOnCalendar(page, targetDate);
  } catch (error) {
    console.log(error);
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
};

bookTicket();
