import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: { watchlist } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const { ticker } = await req.json();
    if (!ticker) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Ticker is required" } }, { status: 400 });
    }

    const watchlistItem = await prisma.watchlist.create({
      data: { userId, ticker }
    });

    return NextResponse.json({ success: true, data: watchlistItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
