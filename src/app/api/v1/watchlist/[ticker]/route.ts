import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../../lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const { ticker } = await params;
    
    await prisma.watchlist.deleteMany({
      where: { userId, ticker }
    });

    return NextResponse.json({ success: true, data: { message: `Deleted ${ticker} from watchlist` } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
