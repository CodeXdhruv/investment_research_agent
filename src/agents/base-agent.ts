import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const getGeminiModel = (temperature = 0.2) => {
  return new ChatGoogleGenerativeAI({
    model: "gemma-4-31b-it",
    maxOutputTokens: 8192,
    temperature,
    apiKey: process.env.GEMINI_API_KEY || "", // Assume user sets GEMINI_API_KEY
  });
};
