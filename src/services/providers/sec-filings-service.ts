import axios from 'axios';

export class SecFilingsService {
  async getLatestFilings(ticker: string) {
    try {
      // 1. Get CIK from ticker
      const companyTickersRes = await axios.get('https://www.sec.gov/files/company_tickers.json', {
        headers: {
          'User-Agent': 'TrendxResearch admin@trendx.app'
        }
      });
      
      const companies = Object.values(companyTickersRes.data) as any[];
      const company = companies.find((c) => c.ticker === ticker.toUpperCase());
      
      if (!company) return [];

      const cikStr = company.cik_str.toString().padStart(10, '0');

      // 2. Fetch submissions
      const submissionsRes = await axios.get(`https://data.sec.gov/submissions/CIK${cikStr}.json`, {
        headers: {
          'User-Agent': 'TrendxResearch admin@trendx.app'
        }
      });

      const recentFilings = submissionsRes.data.filings.recent;
      const filings = [];

      for (let i = 0; i < recentFilings.form.length; i++) {
        if (recentFilings.form[i] === '10-K' || recentFilings.form[i] === '10-Q') {
          filings.push({
            type: recentFilings.form[i],
            filingDate: recentFilings.filingDate[i],
            accessionNumber: recentFilings.accessionNumber[i],
            url: `https://www.sec.gov/Archives/edgar/data/${company.cik_str}/${recentFilings.accessionNumber[i].replace(/-/g, '')}/${recentFilings.primaryDocument[i]}`
          });
        }
      }

      return filings.slice(0, 5); // Return top 5 recent 10-K/10-Q
    } catch (e) {
      console.error("SEC Filings Error", e);
      return [];
    }
  }
}

export const secFilingsService = new SecFilingsService();
