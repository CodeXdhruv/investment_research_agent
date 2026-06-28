import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const { id } = await params;
    
    const report = await prisma.analysisJob.findFirst({
      where: { id, user: { clerkUserId: userId } }
    });

    if (!report) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: "Report not found" } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
