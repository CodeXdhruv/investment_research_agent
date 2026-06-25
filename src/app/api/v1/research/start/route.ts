import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { researchWorkflow } from '../../../../../workflows/research-workflow';
import { prisma } from '../../../../../lib/prisma';

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

    let user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@placeholder.com`;
      user = await prisma.user.create({
        data: { clerkUserId: userId, email }
      });
    }
    
    // Pass internal user.id to workflow to associate the DB record
    const report = await researchWorkflow.run(ticker, user.id);
    
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
