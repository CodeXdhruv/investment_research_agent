import { StateGraph, START, END } from '@langchain/langgraph';
import { financeAgent } from '../agents/finance-agent';
import { newsAgent } from '../agents/news-agent';
import { sentimentAgent } from '../agents/sentiment-agent';
import { industryAgent } from '../agents/industry-agent';
import { riskAgent } from '../agents/risk-agent';
import { valuationAgent } from '../agents/valuation-agent';
import { committeeAgent } from '../agents/committee-agent';

// Define the state for the workflow
interface ResearchState {
  ticker: string;
  data: any;
  financeOutput?: any;
  newsOutput?: any;
  sentimentOutput?: any;
  industryOutput?: any;
  riskOutput?: any;
  valuationOutput?: any;
  finalReport?: any;
}

const researchGraph = new StateGraph<ResearchState>({
  channels: {
    ticker: null,
    data: null,
    financeOutput: null,
    newsOutput: null,
    sentimentOutput: null,
    industryOutput: null,
    riskOutput: null,
    valuationOutput: null,
    finalReport: null,
  }
});

// 1. Gather Data (simplified)
researchGraph.addNode("gather_data", async (state) => {
  return {
    data: {
      financials: { revenue: 100 },
      news: "Good news",
      sentiment: "Bullish",
      industry: "Tech",
      risk: "Low",
      valuation: "Fair"
    }
  };
});

// 2. Agents
researchGraph.addNode("finance", async (state) => ({ financeOutput: await financeAgent.analyze(state.data.financials) }));
researchGraph.addNode("news", async (state) => ({ newsOutput: await newsAgent.analyze(state.data.news) }));
researchGraph.addNode("sentiment", async (state) => ({ sentimentOutput: await sentimentAgent.analyze(state.data.sentiment) }));
researchGraph.addNode("industry", async (state) => ({ industryOutput: await industryAgent.analyze(state.data.industry) }));
researchGraph.addNode("risk", async (state) => ({ riskOutput: await riskAgent.analyze(state.data.risk) }));
researchGraph.addNode("valuation", async (state) => ({ valuationOutput: await valuationAgent.analyze(state.data.valuation) }));

// 3. Committee
researchGraph.addNode("committee", async (state) => {
  const outputs = [
    { type: 'finance', data: state.financeOutput },
    { type: 'news', data: state.newsOutput },
    { type: 'sentiment', data: state.sentimentOutput },
    { type: 'industry', data: state.industryOutput },
    { type: 'risk', data: state.riskOutput },
    { type: 'valuation', data: state.valuationOutput }
  ];
  return { finalReport: await committeeAgent.evaluate(outputs) };
});

// Edges
researchGraph.addEdge(START, "gather_data");

// Parallel execution of agents
researchGraph.addEdge("gather_data", "finance");
researchGraph.addEdge("gather_data", "news");
researchGraph.addEdge("gather_data", "sentiment");
researchGraph.addEdge("gather_data", "industry");
researchGraph.addEdge("gather_data", "risk");
researchGraph.addEdge("gather_data", "valuation");

// All agents to committee
researchGraph.addEdge("finance", "committee");
researchGraph.addEdge("news", "committee");
researchGraph.addEdge("sentiment", "committee");
researchGraph.addEdge("industry", "committee");
researchGraph.addEdge("risk", "committee");
researchGraph.addEdge("valuation", "committee");

researchGraph.addEdge("committee", END);

export const compiledResearchGraph = researchGraph.compile();

export class ResearchWorkflow {
  async run(ticker: string) {
    const initialState = { ticker, data: null };
    const finalState = await compiledResearchGraph.invoke(initialState);
    return finalState.finalReport;
  }
}
export const researchWorkflow = new ResearchWorkflow();
