import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const financeOutputSchema = z.object({
  score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  metrics: z.record(z.any())
});

export class FinanceAgent {
  private parser = StructuredOutputParser.fromZodSchema(financeOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert Financial Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following financial data:\n{data}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(this.parser);
    
    try {
      const response = await chain.invoke({
        data: JSON.stringify(data),
        format_instructions: this.parser.getFormatInstructions(),
      });
      return response;
    } catch (e) {
      console.error("FinanceAgent Error", e);
      return { score: 50, strengths: [], weaknesses: [], metrics: data };
    }
  }
}

export const financeAgent = new FinanceAgent();
