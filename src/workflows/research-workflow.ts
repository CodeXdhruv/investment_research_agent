import { StateGraph, START, END } from '@langchain/langgraph';
import { financeAgent } from '../agents/finance-agent';
import { newsAgent } from '../agents/news-agent';
import { sentimentAgent } from '../agents/sentiment-agent';
import { industryAgent } from '../agents/industry-agent';
import { riskAgent } from '../agents/risk-agent';
import { valuationAgent } from '../agents/valuation-agent';
import { committeeAgent } from '../agents/committee-agent';
import { prisma } from '../lib/prisma';
import { yahooFinanceService } from '../services/providers/yahoo-finance-service';
import { finnhubService } from '../services/providers/finnhub-service';
import { newsApiService } from '../services/providers/news-api-service';
import { redditApiService } from '../services/providers/reddit-api-service';
import { secFilingsService } from '../services/providers/sec-filings-service';

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

// 1. Gather Data
researchGraph.addNode("gather_data", async (state) => {
  const ticker = state.ticker;
  
  // Run all provider fetches in parallel
  const [financials, valuation, profile, news, sentiment, filings] = await Promise.all([
    yahooFinanceService.getFinancialData(ticker),
    yahooFinanceService.getValuationMetrics(ticker),
    finnhubService.getCompanyProfile(ticker),
    newsApiService.getCompanyNews(ticker),
    redditApiService.getMarketSentiment(ticker),
    secFilingsService.getLatestFilings(ticker)
  ]);

  return {
    data: {
      financials,
      valuation,
      industry: profile,
      news,
      sentiment,
      risk: { filings, financials, valuation }, // Pass aggregated data for risk analysis
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
  async run(ticker: string, userId?: string) {
    const initialState = { ticker, data: null };
    const finalState = await compiledResearchGraph.invoke(initialState);
    
    // Store in DB if userId is provided
    if (userId) {
      try {
        await prisma.researchReport.create({
          data: {
            userId,
            company: ticker, // Placeholder: resolve real name via provider
            ticker,
            recommendation: finalState.finalReport.recommendation,
            score: finalState.finalReport.score,
            confidence: finalState.finalReport.confidence,
            summary: finalState.finalReport.reasoning,
            agentOutputs: {
              create: [
                { agentName: 'finance', output: JSON.stringify(finalState.financeOutput) },
                { agentName: 'news', output: JSON.stringify(finalState.newsOutput) },
                { agentName: 'sentiment', output: JSON.stringify(finalState.sentimentOutput) },
                { agentName: 'industry', output: JSON.stringify(finalState.industryOutput) },
                { agentName: 'risk', output: JSON.stringify(finalState.riskOutput) },
                { agentName: 'valuation', output: JSON.stringify(finalState.valuationOutput) }
              ]
            }
          }
        });
      } catch (err) {
        console.error("Failed to store research report", err);
      }
    }

    return finalState.finalReport;
  }
}
export const researchWorkflow = new ResearchWorkflow();
