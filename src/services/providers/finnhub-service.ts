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
  async getUpcomingEarnings() {
    if (!this.apiKey) return [];
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 14);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      const response = await axios.get(`${this.baseUrl}/calendar/earnings?from=${fromStr}&to=${toStr}&token=${this.apiKey}`);
      return response.data.earningsCalendar || [];
    } catch (e) {
      console.error("Finnhub getUpcomingEarnings Error", e);
      return [];
    }
  }
}

export const finnhubService = new FinnhubService();
