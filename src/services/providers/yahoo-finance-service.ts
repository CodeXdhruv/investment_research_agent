import yf from 'yahoo-finance2';

const YFClass = (yf as any).default || yf;
const yahooFinance = new YFClass({ suppressNotices: ['yahooSurvey'] });

export class YahooFinanceService {
  async getFinancialData(ticker: string) {
    try {
      const result = await yahooFinance.quoteSummary(ticker, {
        modules: ['financialData', 'defaultKeyStatistics', 'assetProfile', 'balanceSheetHistory', 'cashflowStatementHistory']
      });
      
      const fd = result.financialData;
      const ap = result.assetProfile;
      return {
        sector: ap?.sector || 'Unknown',
        industry: ap?.industry || 'Unknown',
        totalRevenue: fd?.totalRevenue,
        netIncome: fd?.netIncomeToCommon || fd?.ebitda || fd?.grossProfits,
        grossMargins: fd?.grossMargins || fd?.profitMargins || fd?.operatingMargins,
        operatingMargins: fd?.operatingMargins,
        returnOnEquity: fd?.returnOnEquity,
        totalDebt: fd?.totalDebt,
        debtToEquity: fd?.debtToEquity,
        currentPrice: fd?.currentPrice,
        targetMeanPrice: fd?.targetMeanPrice
      };
    } catch (e: any) {
      console.error(`Yahoo Finance getFinancialData Error for ${ticker}:`, e.message);
      // Fallback: If it's a crypto or lacks fundamentals, just get the current price
      try {
        const quote = await yahooFinance.quote(ticker);
        return {
          sector: 'Unknown',
          industry: 'Unknown',
          currentPrice: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent
        };
      } catch (fallbackErr) {
        return null;
      }
    }
  }
  
  async getValuationMetrics(ticker: string) {
    try {
      const result = await yahooFinance.quoteSummary(ticker, {
        modules: ['defaultKeyStatistics']
      });
      
      const stats = result.defaultKeyStatistics;
      return { 
        peRatio: stats?.forwardPE, 
        pegRatio: stats?.pegRatio,
        priceToBook: stats?.priceToBook,
        enterpriseToEbitda: stats?.enterpriseToEbitda
      };
    } catch (e) {
      console.error("Yahoo Finance getValuationMetrics Error", e);
      return null;
    }
  }

  async getHistoricalPrices(ticker: string, period1: string) {
    try {
      return await yahooFinance.historical(ticker, { period1 });
    } catch (e) {
      console.error("Yahoo Finance getHistoricalPrices Error", e);
      return [];
    }
  }

  async getTrending() {
    try {
      const result = await yahooFinance.trendingSymbols('US');
      return result.quotes.map(q => q.symbol);
    } catch (e) {
      console.error("Yahoo Finance getTrending Error", e);
      return [];
    }
  }

    async getQuote(ticker: string) {
    try {
      const quote = await yahooFinance.quote(ticker);
      return {
        currentPrice: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        marketCap: quote.marketCap,
        volume: quote.regularMarketVolume,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        fiftyDayAverage: quote.fiftyDayAverage,
        twoHundredDayAverage: quote.twoHundredDayAverage,
      };
    } catch (e) {
      console.error(`YahooFinance getQuote Error for ${ticker}`, e);
      return null;
    }
  }
}

export const yahooFinanceService = new YahooFinanceService();
