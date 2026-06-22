import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  summary: z.string()
});

export class ModeratorAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(bullArgs: any, bearArgs: any) {
    const model = getGeminiModel(0.2); 
    
    const prompt = PromptTemplate.fromTemplate(`
      You are a neutral Debate Moderator.
      Summarize the following Bull and Bear arguments objectively.
      Bull Arguments: {bullArgs}
      Bear Arguments: {bearArgs}
      
      {format_instructions}
    `);
    
    const chain = prompt.pipe(model).pipe(this.parser);
    
    try {
      return await chain.invoke({
        bullArgs: JSON.stringify(bullArgs),
        bearArgs: JSON.stringify(bearArgs),
        format_instructions: this.parser.getFormatInstructions(),
      });
    } catch (e) {
      console.error("ModeratorAgent Error", e);
      return { summary: "Failed to generate debate summary." };
    }
  }
}

export const moderatorAgent = new ModeratorAgent();
