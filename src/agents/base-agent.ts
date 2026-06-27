import { ChatOpenAI } from "@langchain/openai";

export const getGeminiModel = (temperature = 0.2) => {
  return new ChatOpenAI({
    modelName: "openrouter/free",
    maxTokens: 4000,
    temperature,
    apiKey: process.env.OPENROUTER_API_KEY || "",
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Investment Research Agent",
      }
    }
  });
};
