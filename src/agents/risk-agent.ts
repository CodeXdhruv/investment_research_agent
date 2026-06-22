import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  score: z.number().min(0).max(100),
  risks: z.array(z.string())
});

export class RiskAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert Risk Manager.
      Analyze the following risk data for competition, regulatory, debt, and macro risks:
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
      console.error("RiskAgent Error", e);
      return { score: 50, risks: ["Data unavailable"] };
    }
  }
}

export const riskAgent = new RiskAgent();
