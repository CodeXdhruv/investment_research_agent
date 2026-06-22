import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  arguments: z.array(z.string())
});

export class BearAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.7); 
    
    const prompt = PromptTemplate.fromTemplate(`
      You are the ultimate Bear Investor (Short Seller).
      Generate the strongest bearish thesis based on the following data:
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
      console.error("BearAgent Error", e);
      return { arguments: [] };
    }
  }
}

export const bearAgent = new BearAgent();
