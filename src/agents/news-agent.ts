import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const newsOutputSchema = z.object({
  score: z.number().min(0).max(100),
  keyEvents: z.array(z.string()),
  marketImpact: z.string()
});

export class NewsAgent {
  private parser = StructuredOutputParser.fromZodSchema(newsOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.2);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert News and Macro-economic Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following news data:\n{data}\n\n{format_instructions}"]
    ]);
    
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
