import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export class RagService {
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      model: "text-embedding-004", // default Gemini embeddings model
      apiKey: process.env.GOOGLE_API_KEY || "dummy_key",
    });
  }

  async indexFiling(filingId: string, text: string) {
    try {
      // 1. Chunking
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([text], [{ filingId }]);

      // 2. Embedding -> ChromaDB
      const vectorStore = await Chroma.fromDocuments(docs, this.embeddings, {
        collectionName: "sec_filings",
        url: "http://localhost:8000" // Placeholder for ChromaDB connection
      });

      return { success: true, count: docs.length };
    } catch (error) {
      console.error("RAG Index Error", error);
      return { success: false, error };
    }
  }

  async query(question: string, filters: any = {}) {
    try {
      // 1. Retrieval
      const vectorStore = new Chroma(this.embeddings, {
        collectionName: "sec_filings",
        url: "http://localhost:8000"
      });

      const results = await vectorStore.similaritySearch(question, 3, filters);
      const context = results.map(r => r.pageContent).join("\n\n");

      // 2. Gemini Response
      const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0.1,
        apiKey: process.env.GOOGLE_API_KEY || "dummy_key",
      });

      const prompt = PromptTemplate.fromTemplate(`
        You are a financial analyst answering a question based on SEC filings.
        Use the following retrieved context to answer the question. If the answer is not in the context, say "I don't know based on the filings."
        
        Context:
        {context}
        
        Question:
        {question}
        
        Answer:
      `);

      const chain = prompt.pipe(model).pipe(new StringOutputParser());
      const answer = await chain.invoke({ context, question });

      return answer;
    } catch (error) {
      console.error("RAG Query Error", error);
      return "An error occurred while querying the SEC filings.";
    }
  }
}

export const ragService = new RagService();
