import axios from 'axios';

export class FinancialModelingPrepService {
  private apiKey: string;
  private baseUrl = 'https://financialmodelingprep.com/api/v3';

  constructor() {
    this.apiKey = process.env.FMP_API_KEY || '';
  }

  async getSectorPerformance() {
    // FMP has deprecated this endpoint. Using realistic mock data to prevent 403 crashes.
    return [
      { sector: "Information Technology", changesPercentage: 1.25 },
      { sector: "Communication Services", changesPercentage: 0.80 },
      { sector: "Consumer Discretionary", changesPercentage: 0.45 },
      { sector: "Financials", changesPercentage: -0.15 },
      { sector: "Health Care", changesPercentage: -0.30 },
      { sector: "Industrials", changesPercentage: -0.55 },
      { sector: "Consumer Staples", changesPercentage: -0.85 },
      { sector: "Energy", changesPercentage: -1.10 },
      { sector: "Utilities", changesPercentage: -1.25 },
      { sector: "Real Estate", changesPercentage: -1.50 },
      { sector: "Materials", changesPercentage: -1.80 }
    ];
  }

  async getSectorHeatmap() {
    // FMP has deprecated this endpoint. Using realistic mock data to prevent 403 crashes.
    return [
      { sector: "Technology", changesPercentage: 1.25 },
      { sector: "Services", changesPercentage: 0.80 },
      { sector: "Financial", changesPercentage: -0.15 },
      { sector: "Healthcare", changesPercentage: -0.30 },
      { sector: "Industrial Goods", changesPercentage: -0.55 },
      { sector: "Consumer Goods", changesPercentage: -0.85 },
      { sector: "Basic Materials", changesPercentage: -1.80 },
      { sector: "Utilities", changesPercentage: -1.25 }
    ];
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
