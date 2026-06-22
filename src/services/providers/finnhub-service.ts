import axios from 'axios';

export class FinnhubService {
  private apiKey: string;
  private baseUrl = 'https://finnhub.io/api/v1';

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
  }

  async getCompanyProfile(ticker: string) {
    if (!this.apiKey) return { ticker, name: "Sample Company (No API Key)", industry: "Unknown" };
    try {
      const response = await axios.get(`${this.baseUrl}/stock/profile2?symbol=${ticker}&token=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("Finnhub getCompanyProfile Error", e);
      return null;
    }
  }
  
  async getPeers(ticker: string) {
    if (!this.apiKey) return ["AAPL", "MSFT", "GOOGL"]; // fallback
    try {
      const response = await axios.get(`${this.baseUrl}/stock/peers?symbol=${ticker}&token=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("Finnhub getPeers Error", e);
      return [];
    }
  }
}

export const finnhubService = new FinnhubService();
