import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

// @ts-ignore
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({ success: true, results: [] });
    }

    const result = await yahooFinance.search(query, {
      quotesCount: 5,
      newsCount: 0,
      enableFuzzyQuery: true,
      quotesQueryId: 'tss_match_phrase_query'
    });

    const results = (result.quotes || [])
      .filter((q: any) => q.isYahooFinance === true && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF'))
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange
      }));

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
