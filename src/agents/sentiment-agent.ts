import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const sentimentOutputSchema = z.object({
  score: z.number().min(0).max(100),
  bullishFactors: z.array(z.string()),
  bearishFactors: z.array(z.string()),
  overallMood: z.string()
});

export class SentimentAgent {
  private parser = StructuredOutputParser.fromZodSchema(sentimentOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.2);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert Market Sentiment Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following market sentiment data:\n{data}\n\n{format_instructions}"]
    ]);
    
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
