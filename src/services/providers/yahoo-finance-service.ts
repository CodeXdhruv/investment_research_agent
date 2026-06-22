export class YahooFinanceService {
  async getFinancialData(ticker: string) {
    // Return mock data for now
    return { revenue: 1000000, profit: 500000 };
  }
  
  async getValuationMetrics(ticker: string) {
    return { peRatio: 25, pegRatio: 1.5 };
  }
}

export const yahooFinanceService = new YahooFinanceService();
