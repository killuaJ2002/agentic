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
  description: "Access to google calender",
  schema: z.object({}), // no input needed
  func: async () => {
    return "calender";
  },
});

export { date_tool, calender_tool };
