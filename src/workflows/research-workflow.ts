import { financeAgent } from '../agents/finance-agent';
import { committeeAgent } from '../agents/committee-agent';

export class ResearchWorkflow {
  async run(ticker: string) {
    // 1. Gather Data (from providers)
    const financialData = { revenue: 100 };
    
    // 2. Run Agents (in parallel ideally)
    const financeOutput = await financeAgent.analyze(financialData);
    
    // 3. Final Committee Evaluation
    const finalReport = await committeeAgent.evaluate([financeOutput]);
    
    return finalReport;
  }
}
export const researchWorkflow = new ResearchWorkflow();
