import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const valuationOutputSchema = z.object({
  score: z.number().min(0).max(100),
  isUndervalued: z.boolean(),
  targetPrice: z.number().optional(),
  reasoning: z.string()
});

export class ValuationAgent {
  private parser = StructuredOutputParser.fromZodSchema(valuationOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert Valuation Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following valuation data:\n{data}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(this.parser);
    
    try {
      return await chain.invoke({
        data: JSON.stringify(data),
        format_instructions: this.parser.getFormatInstructions(),
      });
    } catch (e) {
      console.error("ValuationAgent Error", e);
      return { score: 50, valuationSummary: "Data unavailable for valuation." };
    }
  }
}

export const valuationAgent = new ValuationAgent();
