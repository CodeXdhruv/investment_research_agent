import { NextResponse } from 'next/server';
import { redditApiService } from '../../../../../services/providers/reddit-api-service';
import { sentimentAgent } from '../../../../../agents/sentiment-agent';

// Basic in-memory cache to prevent 429 Rate Limits on frontend polling
let cachedMood: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(req: Request) {
  try {
    const now = Date.now();
    if (cachedMood && now - lastFetchTime < CACHE_DURATION_MS) {
      return NextResponse.json({ success: true, data: { mood: cachedMood }, cached: true });
    }

    // Analyze general market mood based on S&P 500 (SPY)
    const redditData = await redditApiService.getMarketSentiment("SPY");
    const moodAnalysis = await sentimentAgent.analyze(redditData);
    
    cachedMood = moodAnalysis;
    lastFetchTime = now;

    return NextResponse.json({ success: true, data: { mood: moodAnalysis } });
  } catch (error: any) {
    if (cachedMood) {
      // If we hit a rate limit, gracefully fallback to the stale cache
      return NextResponse.json({ success: true, data: { mood: cachedMood }, cached: true, stale: true });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
