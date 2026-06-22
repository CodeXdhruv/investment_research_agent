import axios from 'axios';

export class RedditApiService {
  async getMarketSentiment(ticker: string) {
    try {
      // Using public unauthenticated Reddit search (subject to rate limits)
      const response = await axios.get(`https://www.reddit.com/r/stocks/search.json?q=${ticker}&restrict_sr=1&sort=new&limit=25`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AIInvestmentResearchBot/1.0'
        }
      });
      
      const posts = response.data.data.children.map((child: any) => child.data.title + " " + child.data.selftext);
      
      // We return the raw text, the Sentiment Agent will parse it into bullish/bearish scores
      return { 
        posts: posts.slice(0, 10), // Limit to 10 posts
      };
    } catch (e) {
      console.error("RedditAPI getMarketSentiment Error", e);
      return { posts: [] };
    }
  }
}

export const redditApiService = new RedditApiService();
