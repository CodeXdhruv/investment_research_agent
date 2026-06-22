import { financeAgent } from '../agents/finance-agent';
import { industryAgent } from '../agents/industry-agent';
import { valuationAgent } from '../agents/valuation-agent';
import { getGeminiModel } from '../agents/base-agent';
import { PromptTemplate } from '@langchain/core/prompts';

export class DiscoverWorkflow {
  async run() {
    // 1. Market Scanner (Stub: Return top 3 trending)
    const candidates = ["NVDA", "AMD", "TSM"];
    
    const results = await Promise.all(candidates.map(async (ticker) => {
      // 2. Gather Data (Stub)
      const data = { revenue: 200, industry: "Semiconductors", valuation: "High" };
      
      // 3. Run Agents
      const finance = await financeAgent.analyze(data.revenue);
      const industry = await industryAgent.analyze(data.industry);
      const valuation = await valuationAgent.analyze(data.valuation);
      
      return { ticker, finance, industry, valuation };
    }));
    
    // 4. Ranking Agent
    const model = getGeminiModel(0.1);
    const prompt = PromptTemplate.fromTemplate(`
      You are a Stock Picker.
      Rank the following companies based on their scores and provide a brief rationale for the top pick:
      {results}
    `);
    
    const chain = prompt.pipe(model);
    
    try {
      const ranking = await chain.invoke({
        results: JSON.stringify(results)
      });
      return { candidates: results, ranking: ranking.content };
    } catch (e) {
      console.error("DiscoverWorkflow Error", e);
      return { candidates: results, ranking: "Failed to rank." };
    }
  }
}

export const discoverWorkflow = new DiscoverWorkflow();
