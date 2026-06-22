import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  score: z.number().min(0).max(100),
  marketSize: z.string(),
  growthRate: z.string(),
  trends: z.array(z.string())
});

export class IndustryAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert Industry Analyst.
      Analyze the following industry data:
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
      console.error("IndustryAgent Error", e);
      return { score: 50, marketSize: "Unknown", growthRate: "Unknown", trends: [] };
    }
  }
}

export const industryAgent = new IndustryAgent();
