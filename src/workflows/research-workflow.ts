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
(researchGraph as any).addEdge(START, "gather_data");

// Parallel execution of agents
(researchGraph as any).addEdge("gather_data", "finance");
(researchGraph as any).addEdge("gather_data", "news");
(researchGraph as any).addEdge("gather_data", "sentiment");
(researchGraph as any).addEdge("gather_data", "industry");
(researchGraph as any).addEdge("gather_data", "risk");
(researchGraph as any).addEdge("gather_data", "valuation");

// All agents report to committee
(researchGraph as any).addEdge("finance", "committee");
(researchGraph as any).addEdge("news", "committee");
(researchGraph as any).addEdge("sentiment", "committee");
(researchGraph as any).addEdge("industry", "committee");
(researchGraph as any).addEdge("risk", "committee");
(researchGraph as any).addEdge("valuation", "committee");

(researchGraph as any).addEdge("committee", END);

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
            recommendation: (finalState.finalReport as any).recommendation,
            score: (finalState.finalReport as any).score,
            confidence: (finalState.finalReport as any).confidence,
            summary: (finalState.finalReport as any).reasoning,
            agentOutputs: {
              create: [
                { agentName: 'finance', output: JSON.stringify(finalState.financeOutput) || "{}" },
                { agentName: 'news', output: JSON.stringify(finalState.newsOutput) || "{}" },
                { agentName: 'sentiment', output: JSON.stringify(finalState.sentimentOutput) || "{}" },
                { agentName: 'industry', output: JSON.stringify(finalState.industryOutput) || "{}" },
                { agentName: 'risk', output: JSON.stringify(finalState.riskOutput) || "{}" },
                { agentName: 'valuation', output: JSON.stringify(finalState.valuationOutput) || "{}" }
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

  async *stream(ticker: string, userId?: string) {
    const initialState = { ticker, data: null };
    const stream = await compiledResearchGraph.stream(initialState);
    
    let finalReport: any = null;
    let accumulatedState: any = {};
    for await (const _chunk of stream) {
      const chunk: any = _chunk;
      if (chunk.finance) { accumulatedState.financeOutput = chunk.finance.financeOutput; yield { type: 'agent', agent: 'finance', output: chunk.finance.financeOutput }; }
      if (chunk.news) { accumulatedState.newsOutput = chunk.news.newsOutput; yield { type: 'agent', agent: 'news', output: chunk.news.newsOutput }; }
      if (chunk.sentiment) { accumulatedState.sentimentOutput = chunk.sentiment.sentimentOutput; yield { type: 'agent', agent: 'sentiment', output: chunk.sentiment.sentimentOutput }; }
      if (chunk.industry) { accumulatedState.industryOutput = chunk.industry.industryOutput; yield { type: 'agent', agent: 'industry', output: chunk.industry.industryOutput }; }
      if (chunk.risk) { accumulatedState.riskOutput = chunk.risk.riskOutput; yield { type: 'agent', agent: 'risk', output: chunk.risk.riskOutput }; }
      if (chunk.valuation) { accumulatedState.valuationOutput = chunk.valuation.valuationOutput; yield { type: 'agent', agent: 'valuation', output: chunk.valuation.valuationOutput }; }
      
      if (chunk.committee) {
        accumulatedState.finalReport = chunk.committee.finalReport;
        finalReport = chunk.committee.finalReport;
        yield { type: 'final', output: finalReport };
      }
    }
    
    if (userId && finalReport) {
      try {
        await prisma.researchReport.create({
          data: {
            userId,
            company: ticker,
            ticker,
            recommendation: finalReport.recommendation || 'UNKNOWN',
            score: finalReport.score || 0,
            confidence: finalReport.confidence || 0,
            summary: finalReport.reasoning || 'No summary available.',
            agentOutputs: {
              create: [
                { agentName: 'finance', output: JSON.stringify(accumulatedState.financeOutput) || "{}" },
                { agentName: 'news', output: JSON.stringify(accumulatedState.newsOutput) || "{}" },
                { agentName: 'sentiment', output: JSON.stringify(accumulatedState.sentimentOutput) || "{}" },
                { agentName: 'industry', output: JSON.stringify(accumulatedState.industryOutput) || "{}" },
                { agentName: 'risk', output: JSON.stringify(accumulatedState.riskOutput) || "{}" },
                { agentName: 'valuation', output: JSON.stringify(accumulatedState.valuationOutput) || "{}" }
              ]
            }
          }
        });
      } catch (err) {
        console.error("Failed to store research report", err);
      }
    }
  }
}
export const researchWorkflow = new ResearchWorkflow();
