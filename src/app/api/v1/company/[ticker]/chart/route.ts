import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
yahooFinance.suppressNotices(['yahooSurvey']);

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    const url = new URL(req.url);
    const interval = url.searchParams.get('interval') || '5m';
    const period1 = url.searchParams.get('period1') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const result = await yahooFinance.chart(ticker, {
      period1,
      interval: interval as any,
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
