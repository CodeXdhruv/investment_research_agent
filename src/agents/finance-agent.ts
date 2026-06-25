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

import { StringOutputParser } from '@langchain/core/output_parsers';

export class FinanceAgent {
  private parser = StructuredOutputParser.fromZodSchema(financeOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert Financial Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following financial data:\n{data}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    try {
      let rawOutput = await chain.invoke({
        data: JSON.stringify(data),
        format_instructions: this.parser.getFormatInstructions(),
      });
      
      let cleanJson = rawOutput.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      cleanJson = cleanJson.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");
      cleanJson = cleanJson.replace(/\\(?!"|\\|\/|b|f|n|r|t|u[0-9a-fA-F]{4})/g, "\\\\");
      cleanJson = cleanJson.replace(/,\s*([\]}])/g, "$1");
      
      return await this.parser.parse(cleanJson);
    } catch (e) {
      console.error("FinanceAgent Error", e);
      return { score: 50, strengths: [], weaknesses: [], metrics: data };
    }
  }
}

export const financeAgent = new FinanceAgent();
