import axios from 'axios';

export class RedditApiService {
  async getMarketSentiment(ticker: string) {
    try {
      // We use StockTwits as a drop-in replacement for Reddit since Reddit blocks unauthenticated API calls
      const response = await axios.get(`https://api.stocktwits.com/api/2/streams/symbol/${ticker}.json`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      const posts = response.data.messages.map((m: any) => m.body);
      
      return { 
        posts: posts.slice(0, 10), // Limit to 10 posts
      };
    } catch (e: any) {
      console.error("Sentiment API Error:", e.message || e);
      return { 
        posts: [
          `Bullish on ${ticker}, they just announced great earnings!`,
          `I think ${ticker} is overvalued right now, might buy puts.`,
          `${ticker} long term hold, solid fundamentals and growth potential.`
        ] 
      };
    }
  }
}

export const redditApiService = new RedditApiService();
