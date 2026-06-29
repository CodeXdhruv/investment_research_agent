import axios from 'axios';

export class RedditApiService {
  async getMarketSentiment(category: string) {
    try {
      let sub = 'wallstreetbets';
      if (category === 'Technology' || category === 'Semiconductors' || category === 'AI') sub = 'technology';
      else if (category === 'Crypto') sub = 'CryptoCurrency';
      else if (category === 'Finance' || category === 'Macro') sub = 'economy';
      
      const response = await axios.get(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
        headers: {
          'User-Agent': 'StocksForge/1.0.0'
        }
      });
      
      const rawPosts = response.data.data.children.map((child: any) => child.data);
      
      const posts = rawPosts.map((post: any) => {
        const match = post.title.match(/\b([A-Z]{2,5})\b/);
        const ticker = match ? match[1] : (sub === 'wallstreetbets' ? 'SPY' : sub.substring(0,4).toUpperCase());
        
        return {
          body: post.title,
          ticker: ticker,
          no_of_comments: post.num_comments || 0,
          sentiment: post.ups > 500 ? 'Bullish' : 'Bearish'
        };
      });
      
      return { posts: posts.slice(0, 10) };
    } catch (e: any) {
      console.error("Reddit API Error:", e.message || e);
      return { posts: [] };
    }
  }
}

export const redditApiService = new RedditApiService();
