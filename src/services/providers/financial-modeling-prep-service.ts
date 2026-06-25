import axios from 'axios';

export class FinancialModelingPrepService {
  private apiKey: string;
  private baseUrl = 'https://financialmodelingprep.com/api/v3';

  constructor() {
    this.apiKey = process.env.FMP_API_KEY || '';
  }

  async getSectorPerformance() {
    if (!this.apiKey) return [];
    try {
      const response = await axios.get(`${this.baseUrl}/historical-sectors-performance?limit=1&apikey=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("FMP getSectorPerformance Error", e);
      return [];
    }
  }

  async getSectorHeatmap() {
    if (!this.apiKey) return [];
    try {
      const response = await axios.get(`${this.baseUrl}/stock/sectors-performance?apikey=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("FMP getSectorHeatmap Error", e);
      return [];
    }
  }

  async getIpoCalendar() {
    if (!this.apiKey) return [];
    try {
      // Get IPOs for current month
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 30);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      
      const response = await axios.get(`${this.baseUrl}/ipo-calendar?from=${fromStr}&to=${toStr}&apikey=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("FMP getIpoCalendar Error", e);
      return [];
    }
  }

  async getEconomicCalendar() {
    if (!this.apiKey) return [];
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 7);
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      
      const response = await axios.get(`${this.baseUrl}/economic_calendar?from=${fromStr}&to=${toStr}&apikey=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("FMP getEconomicCalendar Error", e);
      return [];
    }
  }

  async getMarketBreadth() {
    if (!this.apiKey) return null;
    try {
      // FMP doesn't have a direct "market breadth" endpoint in basic tier usually, 
      // but we can query stock market actives or market index
      const response = await axios.get(`${this.baseUrl}/stock_market/actives?apikey=${this.apiKey}`);
      return response.data;
    } catch (e) {
      console.error("FMP getMarketBreadth Error", e);
      return null;
    }
  }
}

export const financialModelingPrepService = new FinancialModelingPrepService();
