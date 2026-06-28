import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { getGeminiModel } from "./base-agent";

// Define the comprehensive schema for the single AI call
const masterSchema = z.object({
  financeOutput: z.object({
    score: z.number().describe("0-100"),
    metrics: z.object({ totalRevenue: z.number().optional(), netIncome: z.number().optional() }).optional(),
    strengths: z.array(z.string().max(40)).max(2).describe("Max 2 short phrases"),
    weaknesses: z.array(z.string().max(40)).max(2).describe("Max 2 short phrases")
  }),
  newsOutput: z.object({
    score: z.number(),
    keyEvents: z.array(z.string().max(40)).max(2)
  }),
  sentimentOutput: z.object({ score: z.number() }),
  industryOutput: z.object({
    score: z.number(),
    summary: z.string().max(60)
  }),
  riskOutput: z.object({
    score: z.number(),
    keyRisks: z.array(z.string().max(40)).max(2)
  }),
  valuationOutput: z.object({
    score: z.number(),
    isUndervalued: z.boolean(),
    reasoning: z.string().max(40)
  }),
  finalReport: z.object({
    recommendation: z.string(),
    score: z.number(),
    confidence: z.number(),
    reasoning: z.string().max(60),
  })
});

const parser = StructuredOutputParser.fromZodSchema(masterSchema);

export const masterAgent = {
  analyze: async (data: any) => {
    const model = getGeminiModel(0.2);
    
    const prompt = new PromptTemplate({
      template: `You are an expert investment analyst. Analyze the following comprehensive data for a company and provide a detailed analysis in the exact JSON format specified.
      
Data:
{data}

{format_instructions}`,
      inputVariables: ["data"],
      partialVariables: { format_instructions: parser.getFormatInstructions() },
    });

    const chain = prompt.pipe(model).pipe(parser);
    
    try {
      return await chain.invoke({ data: JSON.stringify(data) }); 
    } catch (e) {
      console.error("Master Agent Error:", e);
      throw e;
    }
  }
};
