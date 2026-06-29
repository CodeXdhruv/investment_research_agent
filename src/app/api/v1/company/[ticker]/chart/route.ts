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
    let p1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let is1d = false;

    if (url.searchParams.get('period1')) {
      p1 = url.searchParams.get('period1')!;
    } else if (range === '1d' || !range) {
      is1d = true;
      p1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(); // Fetch 5 days, we'll filter to the last active day
    } else if (range === '5d') {
      p1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    } else if (range === '1mo') {
      p1 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    const chartOptions: any = { interval: interval as any, period1: p1 };

    const result = await yahooFinance.chart(ticker, chartOptions);
    
    // If it's a 1d request, filter the quotes to only include the most recent calendar day present in the dataset.
    // This perfectly solves the "weekend void" problem where period1=24h ago yields 0 results.
    if (is1d && result && result.quotes && result.quotes.length > 0) {
      const lastQuoteDate = new Date(result.quotes[result.quotes.length - 1].date);
      const lastDayString = lastQuoteDate.toISOString().split('T')[0];
      result.quotes = result.quotes.filter((q: any) => new Date(q.date).toISOString().split('T')[0] === lastDayString);
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
