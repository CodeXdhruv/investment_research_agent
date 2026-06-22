import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  score: z.number().min(0).max(100),
  valuationSummary: z.string()
});

export class ValuationAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert Valuation Analyst.
      Analyze the following valuation data (PE, PEG, PB, Fair Value):
      {data}
      
      {format_instructions}
    `);
    
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
