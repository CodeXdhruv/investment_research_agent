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

  async getIpoCalendar() {
    if (!this.apiKey) return [];
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 30);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      const response = await axios.get(`${this.baseUrl}/calendar/ipo?from=${fromStr}&to=${toStr}&token=${this.apiKey}`);
      return response.data.ipoCalendar?.map((ipo: any) => ({
        date: ipo.date,
        company: ipo.name,
        symbol: ipo.symbol,
        price: ipo.price || "TBD",
        exchange: ipo.exchange || "US"
      })) || [];
    } catch (e) {
      console.error("Finnhub getIpoCalendar Error", e);
      return [];
    }
  }

  async getEconomicCalendar() {
    try {
      const response = await axios.get(`https://nfs.faireconomy.media/ff_calendar_thisweek.json`);
      const eco = response.data || [];
      const today = new Date().toISOString();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return eco
        .filter((e: any) => e.country === 'USD' && e.date >= today && e.date <= nextWeek)
        .slice(0, 10)
        .map((e: any) => ({
          date: e.date,
          event: e.title,
          country: 'US',
          consensus: e.forecast || e.previous || 'N/A',
          actual: null
        }));
    } catch (e) {
      console.error("ForexFactory getEconomicCalendar Error", e);
      return [];
    }
  }
}

export const finnhubService = new FinnhubService();
