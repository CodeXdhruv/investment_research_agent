import { researchWorkflow } from './research-workflow';
import { getGeminiModel } from '../agents/base-agent';
import { PromptTemplate } from '@langchain/core/prompts';

export class CompareWorkflow {
  async run(tickers: string[]) {
    // 1. Run Research Workflow for each company in parallel
    const researchPromises = tickers.map(ticker => researchWorkflow.run(ticker));
    const reports = await Promise.all(researchPromises);

    // 2. Comparison Generator (Using Gemini directly)
    const model = getGeminiModel(0.2);
    const prompt = PromptTemplate.fromTemplate(`
      You are an expert Investment Analyst.
      Compare the following investment reports for {tickers}:
      {reports}

      Provide a detailed comparison highlighting relative strengths, weaknesses, and the best overall investment.
      Return the comparison as a detailed text summary.
    `);

    const chain = prompt.pipe(model);
    
    try {
      const comparison = await chain.invoke({
        tickers: tickers.join(", "),
        reports: JSON.stringify(reports),
      });
      
      return { reports, comparison: comparison.content };
    } catch (e) {
      console.error("CompareWorkflow Error", e);
      return { reports, comparison: "Failed to generate comparison." };
    }
  }
}

export const compareWorkflow = new CompareWorkflow();
