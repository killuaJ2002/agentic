import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { date_tool, calender_tool } from "./tools.js";
import "dotenv/config";

// 🔧 Helper to escape curly braces for LangChain templates
function escapeBraces(str) {
  return str.replace(/[{]/g, "{{").replace(/[}]/g, "}}");
}

// Step 1: Define structured schema using zod
const bookingSchema = z.object({
  from: z.string().describe("Departure city or location"),
  to: z.string().describe("Destination city or location"),
  date: z
    .string()
    .describe("Travel date in YYYY-MM-DD format or 'Not specified'"),
});

// Step 2: Create structured parser and get format instructions
const parser = StructuredOutputParser.fromZodSchema(bookingSchema);
const formatInstructions = parser.getFormatInstructions();

// Step 3: Define prompt including escaped format instructions
const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a train ticket booking assistant. Your job is to extract travel details from user queries.

If the user mentions a vague or holiday-related date (e.g., "on Janmashtami", "next Diwali", "by National Day"), resolve it to a specific date.

If the query contains multiple locations (such as both a source and a destination), prioritize looking for the holiday in the **departure/source location** first. If it's not found there, check the **destination** location. Use the available tools to query holidays in both locations if required — calling tools more than once is allowed.

If the resolved holiday is already in the past (compared to the current date), assume the user is referring to the same holiday in the **next year**.

If you need the current date or holiday information, use the appropriate tools.

Always return your output in this format:

${escapeBraces(formatInstructions)}`,
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

// Step 4: Set up LLM
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-pro",
  temperature: 0.8,
});

// Step 5: Create agent with tools
const tools = [date_tool, calender_tool];

const agent = createToolCallingAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({ agent, tools });

// Step 6: Expose structured runAgent function
const runAgent = async (query) => {
  const result = await agentExecutor.invoke({ input: query });

  try {
    const parsed = await parser.parse(result.output);
    return parsed; // { from, to, date }
  } catch (err) {
    console.error("❌ Parsing failed:", err.message);
    return { from: "Error", to: "Error", date: "Error" };
  }
};

export { runAgent };
