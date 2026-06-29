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
    let chartOptions: any = { interval: interval as any };
    
    if (url.searchParams.get('period1')) {
      chartOptions.period1 = url.searchParams.get('period1');
    } else if (range) {
      chartOptions.range = range;
    } else {
      chartOptions.range = '1d';
    }

    const result = await yahooFinance.chart(ticker, chartOptions);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
