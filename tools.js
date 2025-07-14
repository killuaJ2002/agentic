// tools.js
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";

const date_tool = new DynamicStructuredTool({
  name: "current-date",
  description: "Returns the current date.",
  schema: z.object({}), // no input needed
  func: async () => {
    console.log("📅 Tool called");
    return new Date().toDateString();
  },
});

const calender_tool = new DynamicStructuredTool({
  name: "calender-tool",
  description: "Access to holiday calendar",
  schema: z.object({
    country: z
      .string()
      .optional()
      .describe("2-letter country code, defaults to 'IN'"),
    year: z
      .number()
      .optional()
      .describe("Year to fetch holidays, defaults to current year"),
  }),

  func: async ({ country = "IN", year = new Date().getFullYear() }) => {
    const api_key = process.env.CALENDER_KEY;
    try {
      const res = await fetch(
        `https://calendarific.com/api/v2/holidays?api_key=${api_key}&country=${country}&year=${year}`
      );
      const data = await res.json();
      const holidays = data.response.holidays;

      if (!holidays.length)
        return `No holidays found for ${country} in ${year}.`;

      const formatted = holidays.map((h) => {
        const date = h.date?.iso ?? "Unknown date";
        const name = h.name ?? "Unnamed Holiday";
        const type = h.primary_type ?? h.type?.[0] ?? "Holiday";
        return `- ${date}: ${name} [${type}]`;
      });

      return (
        `📅 Holidays in ${country.toUpperCase()} for ${year}:\n` +
        formatted.join("\n")
      );
    } catch (error) {
      console.error("❌ Error fetching holidays:", error.message);
      return "Failed to fetch holidays.";
    }
  },
});

export { date_tool, calender_tool };
