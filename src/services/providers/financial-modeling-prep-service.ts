import axios from 'axios';
import { yahooFinanceService } from './yahoo-finance-service';

export class FinancialModelingPrepService {
  private apiKey: string;
  private baseUrl = 'https://financialmodelingprep.com/api/v3';

  constructor() {
    this.apiKey = process.env.FMP_API_KEY || '';
  }

  async getSectorPerformance() {
    try {
      const etfs = [
        { symbol: 'XLK', sector: 'Information Technology' },
        { symbol: 'XLV', sector: 'Health Care' },
        { symbol: 'XLF', sector: 'Financials' },
        { symbol: 'XLE', sector: 'Energy' },
        { symbol: 'XLY', sector: 'Consumer Discretionary' },
        { symbol: 'XLP', sector: 'Consumer Staples' },
        { symbol: 'XLI', sector: 'Industrials' },
        { symbol: 'XLB', sector: 'Materials' },
        { symbol: 'XLU', sector: 'Utilities' },
        { symbol: 'XLRE', sector: 'Real Estate' },
        { symbol: 'XLC', sector: 'Communication Services' }
      ];
      
      const promises = etfs.map(e => yahooFinanceService.getQuote(e.symbol));
      const quotes = await Promise.all(promises);
      
      return etfs.map((e, i) => ({
        sector: e.sector,
        changesPercentage: quotes[i]?.changePercent || 0
      })).sort((a, b) => b.changesPercentage - a.changesPercentage);
    } catch (e) {
      console.error("Error fetching sector performance:", e);
      return [];
    }
  }

  async getSectorHeatmap() {
    try {
      const performance = await this.getSectorPerformance();
      return performance.map(s => ({
        sector: s.sector.replace('Information Technology', 'Technology').replace('Communication Services', 'Services'),
        changesPercentage: s.changesPercentage
      }));
    } catch (e) {
      return [];
    }
  }

  async getIpoCalendar() {
    return [];
  }

  async getEconomicCalendar() {
    return [];
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
