import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const committeeOutputSchema = z.object({
  recommendation: z.enum(["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  reasoning: z.string()
});

export class CommitteeAgent {
  private parser = StructuredOutputParser.fromZodSchema(committeeOutputSchema);

  async evaluate(agentOutputs: any[]) {
    const model = getGeminiModel(0.1); 
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Head of the Investment Committee. You must strictly output valid JSON matching the format instructions. Provide the final investment verdict based on the sub-agents' inputs."],
      ["user", "Review the following aggregated reports from your specialized agents:\n{reports}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(this.parser);
    
    try {
      return await chain.invoke({
        reports: JSON.stringify(agentOutputs),
        format_instructions: this.parser.getFormatInstructions(),
      });
    } catch (e) {
      console.error("CommitteeAgent Error", e);
      return {
        recommendation: "HOLD" as const,
        confidence: 0.5,
        score: 50,
        reasoning: "Failed to parse final committee decision."
      };
    }
  }
}

export const committeeAgent = new CommitteeAgent();
