import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  score: z.number().min(0).max(100),
  bullish: z.number(),
  bearish: z.number(),
  highlights: z.array(z.string())
});

export class SentimentAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.2);
    
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert Market Sentiment Analyst.
      Analyze the following sentiment data (e.g., Reddit):
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
      console.error("SentimentAgent Error", e);
      return { score: 50, bullish: 50, bearish: 50, highlights: [] };
    }
  }
}

export const sentimentAgent = new SentimentAgent();
