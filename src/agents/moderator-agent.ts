import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const moderatorOutputSchema = z.object({
  summary: z.string(),
  pointsOfAgreement: z.array(z.string()),
  pointsOfContention: z.array(z.string())
});

export class ModeratorAgent {
  private parser = StructuredOutputParser.fromZodSchema(moderatorOutputSchema);
  
  async analyze(bullCase: any, bearCase: any) {
    const model = getGeminiModel(0.2);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a neutral Investment Debate Moderator. You must strictly output valid JSON matching the format instructions. Your job is to objectively summarize the debate."],
      ["user", "Review the Bull Case:\n{bullCase}\n\nReview the Bear Case:\n{bearCase}\n\n{format_instructions}"]
    ]);
    
    const chain = prompt.pipe(model).pipe(this.parser);
    
    try {
      return await chain.invoke({
        bullCase: JSON.stringify(bullCase),
        bearCase: JSON.stringify(bearCase),
        format_instructions: this.parser.getFormatInstructions(),
      });
    } catch (error) {
      console.error("ModeratorAgent Error", error);
      return { summary: "Error generating moderator summary", pointsOfAgreement: [], pointsOfContention: [] };
    }
  }
}

export const moderatorAgent = new ModeratorAgent();
