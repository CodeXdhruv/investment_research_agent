import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ragService } from '../../../../services/rag/rag-service';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: "Unauthorized" } }, { status: 401 });
    }

    const { question, researchId } = await req.json();
    if (!question || !researchId) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: "Question and researchId are required" } }, { status: 400 });
    }

    // Call RAG Service (filtering by research/filing ID if applicable, here we pass it as a filter)
    const answer = await ragService.query(question, { filingId: researchId });

    // Store Chat History
    await prisma.chatHistory.create({
      data: {
        userId,
        researchId,
        question,
        answer
      }
    });

    return NextResponse.json({ success: true, data: { answer } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } }, { status: 500 });
  }
}
