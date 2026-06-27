import { NextResponse } from 'next/server';
import { compareService } from '../../../../../services/compare-service';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const t1 = url.searchParams.get('t1');
    const t2 = url.searchParams.get('t2');

    if (!t1 || !t2) {
      return NextResponse.json({ success: false, error: 'Tickers missing' }, { status: 400 });
    }

    const compareData = await compareService.getAdvancedComparison(t1, t2);

    return NextResponse.json({
      success: true,
      data: compareData
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error: any) {
    console.error('Advanced Compare Route Error:', error);
    return NextResponse.json({
      success: false,
      error: { message: error.message }
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
