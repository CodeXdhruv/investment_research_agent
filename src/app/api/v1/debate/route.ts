import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { debateWorkflow } from '../../../../workflows/debate-workflow';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const { ticker, thesis } = await req.json();
    if (!ticker || !thesis) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Ticker and thesis are required" } }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;
      user = await prisma.user.create({
        data: { clerkUserId: userId, email }
      });
    }
    
    const debate = await debateWorkflow.run(ticker, user.id);
    return NextResponse.json({ success: true, data: debate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
