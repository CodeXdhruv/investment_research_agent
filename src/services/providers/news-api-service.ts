import axios from 'axios';

export class NewsApiService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.NEWSAPI_API_KEY || '';
  }

  async getCompanyNews(ticker: string) {
    if (!this.apiKey) return [{ title: "Good news (No API Key)", url: "https://example.com" }];
    try {
      const response = await axios.get(`${this.baseUrl}/everything?q=${ticker}&sortBy=publishedAt&pageSize=10&apiKey=${this.apiKey}`);
      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name
      }));
    } catch (e) {
      console.error("NewsAPI getCompanyNews Error", e);
      return [];
    }
  }

  async getMarketNews() {
    if (!this.apiKey) return [{ title: "Market is up (No API Key)", url: "https://example.com" }];
    try {
      const response = await axios.get(`${this.baseUrl}/top-headlines?category=business&country=us&pageSize=15&apiKey=${this.apiKey}`);
      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name
      }));
    } catch (e) {
      console.error("NewsAPI getMarketNews Error", e);
      return [];
    }
  }
}

export const newsApiService = new NewsApiService();
