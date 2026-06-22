import { NextResponse } from 'next/server';
import { finnhubService } from '../../../../../services/providers/finnhub-service';
import { yahooFinanceService } from '../../../../../services/providers/yahoo-finance-service';

export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    
    const [profile, financials, peers] = await Promise.all([
      finnhubService.getCompanyProfile(ticker),
      yahooFinanceService.getFinancialData(ticker),
      finnhubService.getPeers(ticker)
    ]);
    
    return NextResponse.json({ success: true, data: { profile, financials, peers } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
