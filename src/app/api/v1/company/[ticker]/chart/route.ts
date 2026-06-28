import { NextResponse } from 'next/server';
import yf from 'yahoo-finance2';

const YFClass = (yf as any).default || yf;
const yahooFinance = new YFClass({ suppressNotices: ['yahooSurvey'] });

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    const url = new URL(req.url);
    const interval = url.searchParams.get('interval') || '5m';
    const range = url.searchParams.get('range');
    const period1 = url.searchParams.get('period1') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let p1 = period1;
    if (range) {
      if (range === '1d') p1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      else if (range === '5d') p1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      else if (range === '1mo') p1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      else p1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    }
    const chartOptions: any = { interval: interval as any, period1: p1 };

    const result = await yahooFinance.chart(ticker, chartOptions);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
