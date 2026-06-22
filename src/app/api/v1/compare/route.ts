import { NextResponse } from 'next/server';
import { compareWorkflow } from '../../../../workflows/compare-workflow';

export async function POST(req: Request) {
  try {
    const { tickers } = await req.json();
    if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Tickers array is required" } }, { status: 400 });
    }
    
    const comparison = await compareWorkflow.run(tickers);
    return NextResponse.json({ success: true, data: comparison });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
