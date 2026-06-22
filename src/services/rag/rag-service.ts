export class RagService {
  async indexFiling(filingId: string, text: string) {
    // Stub: Chunking -> Embedding -> ChromaDB
    return { success: true };
  }

  async query(question: string, filters: any) {
    // Stub: Embedding -> Retrieval -> Gemini
    return "This is a summarized answer from SEC filings.";
  }
}

export const ragService = new RagService();
