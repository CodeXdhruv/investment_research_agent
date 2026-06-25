import { getGeminiModel } from './base-agent';
import { z } from 'zod';
import { StructuredOutputParser, StringOutputParser } from '@langchain/core/output_parsers';
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
    
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    try {
      let rawOutput = await chain.invoke({
        data: JSON.stringify(data),
        format_instructions: this.parser.getFormatInstructions(),
      });
      
      // Clean and sanitize the LLM output
      let cleanJson = rawOutput.replace(/```json\n?/g, '').replace(/```/g, '').trim();
      cleanJson = cleanJson.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, ""); // Remove control chars
      cleanJson = cleanJson.replace(/\\(?!"|\\|\/|b|f|n|r|t|u[0-9a-fA-F]{4})/g, "\\\\"); // Fix broken escapes
      cleanJson = cleanJson.replace(/,\s*([\]}])/g, "$1"); // Remove trailing commas
      
      return await this.parser.parse(cleanJson);
    } catch (e) {
      console.error("NewsAgent Error", e);
      return { score: 50, positiveNews: [], negativeNews: [], keyEvents: [] };
    }
  }
}

export const newsAgent = new NewsAgent();
