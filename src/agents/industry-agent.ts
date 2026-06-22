import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const industryOutputSchema = z.object({
  score: z.number().min(0).max(100),
  trends: z.array(z.string()),
  competitivePosition: z.string()
});

export class IndustryAgent {
  private parser = StructuredOutputParser.fromZodSchema(industryOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert Industry and Sector Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following industry data:\n{data}\n\n{format_instructions}"]
    ]);
    
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
