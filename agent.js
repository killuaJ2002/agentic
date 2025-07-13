import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import "dotenv/config";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.7,
});

const runLLM = async (input) => {
  const result = await model.invoke(input);
  return result.content;
};

export { runLLM };
