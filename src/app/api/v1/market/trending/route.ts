import { NextResponse } from 'next/server';
import { yahooFinanceService } from '../../../../../services/providers/yahoo-finance-service';

export async function GET(req: Request) {
  try {
    const trending = await yahooFinanceService.getTrending();
    return NextResponse.json({ success: true, data: { trending } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
