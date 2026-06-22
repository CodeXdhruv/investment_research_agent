import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  score: z.number().min(0).max(100),
  positiveNews: z.array(z.string()),
  negativeNews: z.array(z.string()),
  keyEvents: z.array(z.string())
});

export class NewsAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.2);
    
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert News Analyst.
      Analyze the following news data:
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
      console.error("NewsAgent Error", e);
      return { score: 50, positiveNews: [], negativeNews: [], keyEvents: [] };
    }
  }
}

export const newsAgent = new NewsAgent();
