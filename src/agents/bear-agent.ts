import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const bearOutputSchema = z.object({
  thesis: z.string(),
  keyArguments: z.array(z.string()),
  targetPrice: z.number().optional()
});

export class BearAgent {
  private parser = StructuredOutputParser.fromZodSchema(bearOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.4);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a pessimistic Bear Market Analyst. You must strictly output valid JSON matching the format instructions. Your goal is to build the strongest possible negative case for the company."],
      ["user", "Analyze the following data and provide a bearish thesis:\n{data}\n\n{format_instructions}"]
    ]);
    
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
