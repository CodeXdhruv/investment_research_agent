import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { getGeminiModel } from "./base-agent";

// Define the comprehensive schema for the single AI call
const masterSchema = z.object({
  financeOutput: z.object({
    score: z.number().describe("0-100"),
    metrics: z.object({ totalRevenue: z.number().optional(), netIncome: z.number().optional() }).optional(),
    strengths: z.array(z.string()).max(4).describe("List 3-4 key financial strengths incorporating actual statistics or percentages"),
    weaknesses: z.array(z.string()).max(4).describe("List 3-4 key financial risks or weaknesses incorporating actual statistics or percentages")
  }),
  newsOutput: z.object({
    score: z.number(),
    keyEvents: z.array(z.string()).max(4).describe("List 3-4 major news events driving current sentiment")
  }),
  sentimentOutput: z.object({ score: z.number() }),
  industryOutput: z.object({
    score: z.number(),
    summary: z.string().describe("A 2-3 sentence overview of the company's position within its broader industry")
  }),
  riskOutput: z.object({
    score: z.number(),
    keyRisks: z.array(z.string()).max(4).describe("List 3-4 critical market, operational, or macro risks")
  }),
  valuationOutput: z.object({
    score: z.number(),
    isUndervalued: z.boolean(),
    reasoning: z.string().describe("A 2-3 sentence justification of the valuation referencing metrics like P/E, PEG, or DCF")
  }),
  finalReport: z.object({
    recommendation: z.string().describe("E.g., Strong Buy, Buy, Hold, Sell, Strong Sell"),
    score: z.number(),
    confidence: z.number(),
    reasoning: z.string().describe("A concise 2-3 sentence investment thesis. You MUST explicitly quote specific financial stats, revenue numbers, margins, or valuation ratios in this brief summary to justify the final verdict."),
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
