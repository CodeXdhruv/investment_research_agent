import { NextResponse } from 'next/server';
import { dashboardService } from '../../../../../services/dashboard-service';
import { redditApiService } from '../../../../../services/providers/reddit-api-service';
import { sentimentAgent } from '../../../../../agents/sentiment-agent';
import { yahooFinanceService } from '../../../../../services/providers/yahoo-finance-service';
import { discoverWorkflow } from '../../../../../workflows/discover-workflow';

let cachedMood: any = null;
let lastFetchTime: number = 0;
let cachedDiscover: any = null;
let lastDiscoverFetchTime: number = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const category = url.searchParams.get('category') || 'Overview';

    // Fetch Mood
    const getMood = async () => {
      const now = Date.now();
      if (cachedMood && now - lastFetchTime < CACHE_DURATION_MS && !refresh) {
        return cachedMood;
      }
      try {
        const redditData = await redditApiService.getMarketSentiment("SPY");
        const moodAnalysis = await sentimentAgent.analyze(redditData);
        cachedMood = moodAnalysis;
        lastFetchTime = now;
        return moodAnalysis;
      } catch (error) {
        return cachedMood || null;
      }
    };

let discoverPromise: Promise<any> | null = null;

    // Fetch Discover (Top 3 stock LLM rankings)
    const getDiscover = async () => {
      const now = Date.now();
      if (cachedDiscover && now - lastDiscoverFetchTime < CACHE_DURATION_MS && !refresh) {
        return cachedDiscover;
      }
      
      // Promise Deduplication: If a request is already running, wait for it instead of spawning a new one
      if (discoverPromise) {
        return discoverPromise;
      }

      discoverPromise = discoverWorkflow.run().then((discoverAnalysis) => {
        cachedDiscover = discoverAnalysis;
        lastDiscoverFetchTime = Date.now();
        discoverPromise = null; // Clear the lock
        return discoverAnalysis;
      }).catch((error) => {
        discoverPromise = null; // Clear the lock on failure
        return cachedDiscover || null;
      });
      
      return discoverPromise;
    };

    const [dashboard, mood, trending, discover] = await Promise.all([
      dashboardService.getDashboardData(refresh, category).catch(() => null),
      getMood(),
      yahooFinanceService.getTrending().catch(() => []),
      getDiscover()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dashboard,
        mood,
        trending,
        discover
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
