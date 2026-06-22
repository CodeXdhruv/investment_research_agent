import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const getGeminiModel = (temperature = 0.2) => {
  return new ChatGoogleGenerativeAI({
    modelName: "gemini-2.5-flash",
    maxOutputTokens: 2048,
    temperature,
  });
};
