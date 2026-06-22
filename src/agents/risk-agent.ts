import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const riskOutputSchema = z.object({
  score: z.number().min(0).max(100),
  keyRisks: z.array(z.string()),
  mitigatingFactors: z.array(z.string())
});

export class RiskAgent {
  private parser = StructuredOutputParser.fromZodSchema(riskOutputSchema);
  
  async analyze(data: any) {
    const model = getGeminiModel(0.1);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert Risk Management Analyst. You must strictly output valid JSON matching the format instructions."],
      ["user", "Analyze the following risk data:\n{data}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(this.parser);
    
    try {
      return await chain.invoke({
        data: JSON.stringify(data),
        format_instructions: this.parser.getFormatInstructions(),
      });
    } catch (e) {
      console.error("RiskAgent Error", e);
      return { score: 50, risks: ["Data unavailable"] };
    }
  }
}

export const riskAgent = new RiskAgent();
