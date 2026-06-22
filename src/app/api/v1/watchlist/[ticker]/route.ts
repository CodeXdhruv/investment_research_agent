import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { ticker } = await params;
    return NextResponse.json({ success: true, data: { message: `Deleted ${ticker} from watchlist` } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
