export class RedditApiService {
  async getMarketSentiment(ticker: string) {
    return { bullish: 60, bearish: 40 };
  }
}

export const redditApiService = new RedditApiService();
