export class NewsApiService {
  async getCompanyNews(ticker: string) {
    return [{ title: "Good news", url: "https://example.com/good" }];
  }
}

export const newsApiService = new NewsApiService();
