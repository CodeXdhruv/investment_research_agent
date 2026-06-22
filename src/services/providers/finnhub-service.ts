export class FinnhubService {
  async getCompanyProfile(ticker: string) {
    return { ticker, name: "Sample Company", industry: "Technology" };
  }
  
  async getPeers(ticker: string) {
    return ["AAPL", "MSFT", "GOOGL"];
  }
}

export const finnhubService = new FinnhubService();
