import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { researchWorkflow } from '../../../../../workflows/research-workflow';
import { prisma } from '../../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const { ticker, stream: shouldStream } = body;
    
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

    if (shouldStream) {
      // Set up SSE stream
      const encoder = new TextEncoder();
      const streamObj = new ReadableStream({
        async start(controller) {
          try {
            const gen = researchWorkflow.stream(ticker, user.id);
            for await (const event of gen) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            }
            controller.close();
          } catch (error) {
            console.error("Stream error", error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream failed' })}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(streamObj, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Synchronous run
      const report = await researchWorkflow.run(ticker, user.id);
      return NextResponse.json({ success: true, data: report });
    }
  } catch (error: any) {
    console.error("Research start error:", error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
