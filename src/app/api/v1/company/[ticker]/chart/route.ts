import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    const url = new URL(req.url);
    const interval = url.searchParams.get('interval') || '5m';
    const range = url.searchParams.get('range');
    const period1 = url.searchParams.get('period1') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const chartOptions: any = { interval: interval as any };
    if (range) {
      chartOptions.range = range;
    } else {
      chartOptions.period1 = period1;
    }

    const result = await yahooFinance.chart(ticker, chartOptions);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
