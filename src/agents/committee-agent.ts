import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const committeeOutputSchema = z.object({
  recommendation: z.enum(["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"]),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  scoreBreakdown: z.object({
    fundamentals: z.object({ score: z.number(), max: z.literal(30), reasoning: z.string() }),
    newsSentiment: z.object({ score: z.number(), max: z.literal(20), reasoning: z.string() }),
    industryOutlook: z.object({ score: z.number(), max: z.literal(20), reasoning: z.string() }),
    valuation: z.object({ score: z.number(), max: z.literal(20), reasoning: z.string() }),
    riskAssessment: z.object({ score: z.number(), max: z.literal(10), reasoning: z.string() }),
  })
});

export class CommitteeAgent {
  private parser = StructuredOutputParser.fromZodSchema(committeeOutputSchema);

  async evaluate(agentOutputs: any[]) {
    const model = getGeminiModel(0.1); 
    
    // Using StringOutputParser to safely sanitize before passing to StructuredOutputParser
    const { StringOutputParser } = await import('@langchain/core/output_parsers');
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are the Head of the Investment Committee. You must strictly output valid JSON matching the format instructions. Do NOT use any special characters or markdown outside the JSON structure. ONLY output plain text valid JSON. Provide the final investment verdict based on the sub-agents' inputs. Make sure sub-scores accurately add up or do not exceed their max values."],
      ["user", "Review the following aggregated reports from your specialized agents:\n{reports}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    try {
      let rawOutput = await chain.invoke({
        reports: JSON.stringify(agentOutputs),
        format_instructions: this.parser.getFormatInstructions(),
      });
      
      // Clean and sanitize the LLM output
      let cleanJson = rawOutput.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      cleanJson = cleanJson.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, ""); // Remove control chars
      cleanJson = cleanJson.replace(/\\(?!"|\\|\/|b|f|n|r|t|u[0-9a-fA-F]{4})/g, "\\\\"); // Fix broken escapes
      cleanJson = cleanJson.replace(/,\s*([\]}])/g, "$1"); // Remove trailing commas
      
      return await this.parser.parse(cleanJson);
    } catch (e) {
      console.error("CommitteeAgent Error", e);
      return {
        recommendation: "HOLD" as const,
        confidence: 0.5,
        score: 50,
        reasoning: "Failed to parse final committee decision.",
        scoreBreakdown: {
          fundamentals: { score: 15, max: 30, reasoning: "" },
          newsSentiment: { score: 10, max: 20, reasoning: "" },
          industryOutlook: { score: 10, max: 20, reasoning: "" },
          valuation: { score: 10, max: 20, reasoning: "" },
          riskAssessment: { score: 5, max: 10, reasoning: "" },
        }
      };
    }
  }
}

export const committeeAgent = new CommitteeAgent();
