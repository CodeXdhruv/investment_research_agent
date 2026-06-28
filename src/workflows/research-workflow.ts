import { prisma } from '../lib/prisma';
import { yahooFinanceService } from '../services/providers/yahoo-finance-service';
import { finnhubService } from '../services/providers/finnhub-service';
import { newsApiService } from '../services/providers/news-api-service';
import { redditApiService } from '../services/providers/reddit-api-service';
import { secFilingsService } from '../services/providers/sec-filings-service';
import { masterAgent } from '../agents/master-agent';

export class ResearchWorkflow {
  async run(ticker: string, userId?: string) {
    // 1. Check Cache (24-hour stale time)
    if (false && userId) { // Temporarily bypassed to clear out old schema data
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const cachedReport = await prisma.researchReport.findFirst({
        where: {
          ticker,
          userId,
          updatedAt: { gte: twentyFourHoursAgo }
        },
        include: { agentOutputs: true }
      });

      if (cachedReport) {
        console.log(`[CACHE HIT] Using cached report for ${ticker}`);
        
        const outputs = cachedReport.agentOutputs.reduce((acc: any, curr: any) => {
          try {
            acc[`${curr.agentName}Output`] = JSON.parse(curr.output);
          } catch (e) {
            acc[`${curr.agentName}Output`] = {};
          }
          return acc;
        }, {});

        return {
          finalReport: {
            recommendation: cachedReport.recommendation,
            score: cachedReport.score,
            confidence: cachedReport.confidence,
            reasoning: cachedReport.summary
          },
          ...outputs
        };
      }
    }

    // 2. Gather Data (Parallel execution - No AI calls here, just data fetching)
    const [financials, valuation, profile, news, sentiment, filings] = await Promise.all([
      yahooFinanceService.getFinancialData(ticker),
      yahooFinanceService.getValuationMetrics(ticker),
      finnhubService.getCompanyProfile(ticker),
      newsApiService.getCompanyNews(ticker),
      redditApiService.getMarketSentiment(ticker),
      secFilingsService.getLatestFilings(ticker)
    ]);

    const data = {
      financials: {
        sector: financials?.sector,
        industry: financials?.industry,
        totalRevenue: financials?.totalRevenue,
        netIncome: financials?.netIncome,
        grossMargins: financials?.grossMargins,
        debtToEquity: financials?.debtToEquity
      },
      valuation: valuation ? { peRatio: valuation.peRatio, priceToBook: valuation.priceToBook } : null,
      industry: profile ? { name: profile.name, marketCapitalization: profile.marketCapitalization } : null,
      news: news?.slice(0, 2).map((n: any) => ({ title: n.title })) || [],
      sentiment: sentiment?.slice(0, 2) || [],
      risk: { filings: filings?.slice(0, 2).map((f: any) => f.type) },
    };

    // 3. Batch Processing: Single AI Call via Master Agent
    console.log(`[AI PROCESSING] Calling Master Agent for ${ticker}...`);
    const result = await masterAgent.analyze(data);

    // 4. Store in DB
    if (userId) {
      try {
        await prisma.researchReport.create({
          data: {
            userId,
            company: ticker, // Placeholder
            ticker,
            recommendation: result.finalReport.recommendation,
            score: result.finalReport.score,
            confidence: result.finalReport.confidence,
            summary: result.finalReport.reasoning,
            agentOutputs: {
              create: [
                { agentName: 'finance', output: JSON.stringify(result.financeOutput) || "{}" },
                { agentName: 'news', output: JSON.stringify(result.newsOutput) || "{}" },
                { agentName: 'sentiment', output: JSON.stringify(result.sentimentOutput) || "{}" },
                { agentName: 'industry', output: JSON.stringify(result.industryOutput) || "{}" },
                { agentName: 'risk', output: JSON.stringify(result.riskOutput) || "{}" },
                { agentName: 'valuation', output: JSON.stringify(result.valuationOutput) || "{}" }
              ]
            }
          }
        });
      } catch (err) {
        console.error("Failed to store research report", err);
      }
    }

    return result;
  }

  async *stream(ticker: string, userId?: string) {
    const result = await this.run(ticker, userId);
    
    yield { type: 'agent', agent: 'finance', output: JSON.stringify(result.financeOutput || {}) };
    yield { type: 'agent', agent: 'news', output: JSON.stringify(result.newsOutput || {}) };
    yield { type: 'agent', agent: 'sentiment', output: JSON.stringify(result.sentimentOutput || {}) };
    yield { type: 'agent', agent: 'industry', output: JSON.stringify(result.industryOutput || {}) };
    yield { type: 'agent', agent: 'risk', output: JSON.stringify(result.riskOutput || {}) };
    yield { type: 'agent', agent: 'valuation', output: JSON.stringify(result.valuationOutput || {}) };
    
    yield { type: 'final', output: result.finalReport };
  }
}

export const researchWorkflow = new ResearchWorkflow();
