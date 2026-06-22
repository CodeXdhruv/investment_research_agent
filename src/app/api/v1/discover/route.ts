import { NextResponse } from 'next/server';
import { discoverWorkflow } from '../../../../workflows/discover-workflow';

export async function GET(req: Request) {
  try {
    const discoveries = await discoverWorkflow.run();
    return NextResponse.json({ success: true, data: discoveries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
