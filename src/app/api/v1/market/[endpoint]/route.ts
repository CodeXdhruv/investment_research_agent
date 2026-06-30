import { NextResponse } from 'next/server';
import { dashboardService } from '../../../../../services/dashboard-service';
import { redditApiService } from '../../../../../services/providers/reddit-api-service';
import { sentimentAgent } from '../../../../../agents/sentiment-agent';
import { yahooFinanceService } from '../../../../../services/providers/yahoo-finance-service';
import { discoverWorkflow } from '../../../../../workflows/discover-workflow';

// Cache Variables
let cachedMood: any = null;
let lastFetchTime: number = 0;
let cachedDiscover: any = null;
let lastDiscoverFetchTime: number = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000;

let discoverPromise: Promise<any> | null = null;

export async function GET(req: Request, { params }: { params: Promise<{ endpoint: string }> }) {
  try {
    const { endpoint } = await params;
    const url = new URL(req.url);
    const refresh = url.searchParams.get('refresh') === 'true';
    const category = url.searchParams.get('category') || 'Overview';

    if (endpoint === 'dashboard') {
      const dashboardData = await dashboardService.getDashboardData(refresh, category);
      return NextResponse.json({ success: true, data: dashboardData });
    }

    if (endpoint === 'trending') {
      const trending = await yahooFinanceService.getTrending();
      return NextResponse.json({ success: true, data: { trending } });
    }

    if (endpoint === 'mood') {
      const now = Date.now();
      if (cachedMood && now - lastFetchTime < CACHE_DURATION_MS && !refresh) {
        return NextResponse.json({ success: true, data: { mood: cachedMood }, cached: true });
      }
      try {
        const redditData = await redditApiService.getMarketSentiment("SPY");
        const moodAnalysis = await sentimentAgent.analyze(redditData);
        cachedMood = moodAnalysis;
        lastFetchTime = now;
        return NextResponse.json({ success: true, data: { mood: moodAnalysis } });
      } catch (error) {
        if (cachedMood) {
          return NextResponse.json({ success: true, data: { mood: cachedMood }, cached: true, stale: true });
        }
        throw error;
      }
    }

    if (endpoint === 'overview') {
      // Helper to fetch Mood for Overview
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

      const getDiscover = async () => {
        const now = Date.now();
        if (cachedDiscover && now - lastDiscoverFetchTime < CACHE_DURATION_MS && !refresh) {
          return cachedDiscover;
        }
        if (discoverPromise) return discoverPromise;

        discoverPromise = discoverWorkflow.run().then((discoverAnalysis) => {
          cachedDiscover = discoverAnalysis;
          lastDiscoverFetchTime = Date.now();
          discoverPromise = null;
          return discoverAnalysis;
        }).catch((error) => {
          discoverPromise = null;
          return cachedDiscover || null;
        });
        
        return cachedDiscover || null; // Return cached or null immediately, don't await the promise
      };

      // Start discover fetch in background if not cached
      getDiscover();

      const [dashboard, mood, trending] = await Promise.all([
        dashboardService.getDashboardData(refresh, category).catch(() => null),
        getMood(),
        yahooFinanceService.getTrending().catch(() => [])
      ]);

      return NextResponse.json({
        success: true,
        data: { dashboard, mood, trending, discover: cachedDiscover || null }
      });
    }

    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }, { status: 404 });
  } catch (error: any) {
    console.error(`Market Route Error:`, error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
