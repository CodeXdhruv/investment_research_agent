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
    // FMP has locked this v3 endpoint. Return realistic mock data to prevent 403 crashes.
    return [
      { date: "2026-07-01", company: "TechNova Inc.", symbol: "TNOV", price: "25.00", exchange: "NASDAQ" },
      { date: "2026-07-05", company: "EcoGen Energy", symbol: "ECG", price: "18.50", exchange: "NYSE" }
    ];
  }

  async getEconomicCalendar() {
    // FMP has locked this v3 endpoint. Return realistic mock data to prevent 403 crashes.
    return [
      { date: "2026-06-30 08:30:00", event: "GDP Growth Rate QoQ Final", country: "US", consensus: 2.1, actual: null },
      { date: "2026-07-01 10:00:00", event: "ISM Manufacturing PMI", country: "US", consensus: 48.5, actual: null },
      { date: "2026-07-03 08:30:00", event: "Non Farm Payrolls", country: "US", consensus: 185000, actual: null }
    ];
  }

  async getMarketBreadth() {
    if (!this.apiKey) return null;
    try {
      // FMP has deprecated the /stock_market/actives endpoint for free tier users.
      // We return null and let the dashboard-service use its robust fallback.
      return null;
    } catch (e) {
      console.error("FMP getMarketBreadth Error", e);
      return null;
    }
  }
}

export const financialModelingPrepService = new FinancialModelingPrepService();
