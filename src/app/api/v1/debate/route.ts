import { NextResponse } from 'next/server';
import { debateWorkflow } from '../../../../workflows/debate-workflow';

export async function POST(req: Request) {
  try {
    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Ticker is required" } }, { status: 400 });
    }
    
    const debate = await debateWorkflow.run(ticker);
    return NextResponse.json({ success: true, data: debate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
