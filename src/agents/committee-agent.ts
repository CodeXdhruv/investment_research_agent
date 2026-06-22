import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

const outputSchema = z.object({
  recommendation: z.enum(["INVEST", "HOLD", "PASS"]),
  confidence: z.number().min(0).max(1),
  score: z.number().min(0).max(100),
  reasoning: z.string()
});

export class CommitteeAgent {
  private parser = StructuredOutputParser.fromZodSchema(outputSchema);

  async evaluate(agentOutputs: any[]) {
    const model = getGeminiModel(0.1); 
    
    const prompt = PromptTemplate.fromTemplate(`
      You are the Head of the Investment Committee.
      Review the following reports from the sub-agents and generate a final investment recommendation.
      Agent Reports: {reports}
      
      {format_instructions}
    `);
    
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
