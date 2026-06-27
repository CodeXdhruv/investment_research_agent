import axios from 'axios';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();
export class NewsApiService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.NEWSAPI_API_KEY || '';
  }

  async getCompanyNews(ticker: string, preferYahoo: boolean = false) {
    let articles: any[] = [];

    const fetchNewsApi = async () => {
      if (!this.apiKey) return [];
      try {
        const response = await axios.get(`${this.baseUrl}/everything?q=${ticker}&language=en&sortBy=relevancy&pageSize=3&apiKey=${this.apiKey}`);
        return response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name
        }));
      } catch (e: any) {
        console.error("NewsAPI Error:", e.message);
        return [];
      }
    };

    const fetchYahoo = async () => {
      try {
        const result = await yahooFinance.search(ticker, { newsCount: 3 });
        if (result.news && result.news.length > 0) {
          return result.news.map((item: any) => ({
             title: item.title,
             description: item.publisher,
             url: item.link,
             publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
             source: item.publisher
          }));
        }
      } catch (e: any) {
        console.error("YahooFinance Error:", e.message);
      }
      return [];
    };

    if (preferYahoo) {
      articles = await fetchYahoo();
      if (articles.length === 0) articles = await fetchNewsApi();
    } else {
      articles = await fetchNewsApi();
      if (articles.length === 0) articles = await fetchYahoo();
    }
    
    return articles;
  }

  async getMarketNews() {
    let articles: any[] = [];

    const fetchNewsApi = async () => {
      if (!this.apiKey) return [];
      try {
        const response = await axios.get(`${this.baseUrl}/top-headlines?category=business&country=us&pageSize=15&apiKey=${this.apiKey}`);
        if (!response.data || !response.data.articles) return [];
        return response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source?.name || 'News Source'
        }));
      } catch (e: any) {
        console.error("NewsAPI getMarketNews Error:", e.message);
        return [];
      }
    };

    const fetchYahooFallback = async () => {
      try {
        // Fetch SPY (S&P 500 ETF) news as a proxy for general market news
        const result = await yahooFinance.search('SPY', { newsCount: 25 });
        if (result.news && result.news.length > 0) {
          const validNews = result.news.filter((item: any) => {
            const pub = (item.publisher || '').toLowerCase();
            const title = (item.title || '').toLowerCase();
            const isJunkPub = pub.includes('entertainment') || pub.includes('sports') || pub.includes('life') || pub.includes('celebrity') || pub.includes('shopping') || pub.includes('style');
            const isJunkTitle = title.includes('prime day') || title.includes('deals') || title.includes('sale');
            return !isJunkPub && !isJunkTitle;
          });
          
          return validNews.slice(0, 15).map((item: any) => ({
             title: item.title,
             description: item.publisher,
             url: item.link,
             publishedAt: item.providerPublishTime ? new Date(item.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
             source: item.publisher
          }));
        }
      } catch (e: any) {
        console.error("YahooFinance Market News Fallback Error:", e.message);
      }
      return [];
    };

    articles = await fetchNewsApi();
    if (articles.length === 0) {
      console.log("NewsAPI quota likely hit or failed. Falling back to Yahoo Finance for Market News...");
      articles = await fetchYahooFallback();
    }

    return articles;
  }
}

export const newsApiService = new NewsApiService();
