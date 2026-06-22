import { NextResponse } from 'next/server';
import { researchWorkflow } from '../../../../workflows/research-workflow';

export async function POST(req: Request) {
  try {
    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Ticker is required" } }, { status: 400 });
    }
    
    // In a real scenario, this might be triggered asynchronously and tracked via DB
    const report = await researchWorkflow.run(ticker);
    
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
