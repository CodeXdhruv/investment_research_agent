import { NextResponse } from 'next/server';
import { redditApiService } from '../../../../../services/providers/reddit-api-service';
import { sentimentAgent } from '../../../../../agents/sentiment-agent';

export async function GET(req: Request) {
  try {
    // Analyze general market mood based on S&P 500 (SPY)
    const redditData = await redditApiService.getMarketSentiment("SPY");
    const moodAnalysis = await sentimentAgent.analyze(redditData);
    
    return NextResponse.json({ success: true, data: { mood: moodAnalysis } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
