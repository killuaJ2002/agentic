import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { date_tool } from "./tools.js";
import "dotenv/config";

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a train ticket booking assistant. Your only job is to help users book train tickets.

For train booking queries, extract and respond with:
- From: [departure place or "Not specified"]
- To: [destination place or "Not specified"]
- Date: [travel date or "Not specified"]

For any non-train booking queries (like general questions, other topics, etc.), respond with:
"I can't help with that. I'm a train ticket booking assistant and can only assist with train ticket bookings. Please provide your departure city, destination city, and travel date."`,
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);

// const prompt = ChatPromptTemplate.fromMessages([
//   ["system", `You are a helpful assistant. Answer whatever you know`],
//   ["placeholder", "{chat_history}"],
//   ["human", "{input}"],
//   ["placeholder", "{agent_scratchpad}"],
// ]);

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const tools = [date_tool];

const agent = createToolCallingAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({ agent, tools });

const runAgent = async (query) => {
  const result = await agentExecutor.invoke({ input: query });
  return result.output;
};

export { runAgent };
