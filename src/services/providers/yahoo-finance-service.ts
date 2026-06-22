import yahooFinance from 'yahoo-finance2';

export class YahooFinanceService {
  async getFinancialData(ticker: string) {
    try {
      const result = await yahooFinance.quoteSummary(ticker, {
        modules: ['financialData', 'defaultKeyStatistics', 'balanceSheetHistory', 'cashflowStatementHistory']
      });
      
      const fd = result.financialData;
      return {
        revenue: fd?.totalRevenue,
        profit: fd?.grossProfits,
        operatingMargins: fd?.operatingMargins,
        returnOnEquity: fd?.returnOnEquity,
        totalDebt: fd?.totalDebt,
        debtToEquity: fd?.debtToEquity,
        currentPrice: fd?.currentPrice,
        targetMeanPrice: fd?.targetMeanPrice
      };
    } catch (e) {
      console.error("Yahoo Finance getFinancialData Error", e);
      return null;
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
}

export const yahooFinanceService = new YahooFinanceService();
