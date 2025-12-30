import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { config } from "../config";

class RAGService {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore | null = null;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: "text-embedding-ada-002",
    });
  }

  /**
   * Split text into chunks for better processing
   */
  async splitText(
    text: string,
    chunkSize: number = 500,
    overlap: number = 100
  ): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: overlap,
    });

    const chunks = await splitter.splitText(text);
    console.log(`📦 Text split into ${chunks.length} chunks`);
    return chunks;
  }

  /**
   * Create a vector store from text chunks
   */
  async createVectorStore(text: string): Promise<MemoryVectorStore> {
    try {
      const chunks = await this.splitText(text);

      // Create vector store from chunks
      this.vectorStore = await MemoryVectorStore.fromTexts(
        chunks,
        chunks.map((_, i) => ({ source: `chunk_${i}` })),
        this.embeddings
      );

      console.log(`✅ Vector store created with ${chunks.length} chunks`);
      return this.vectorStore;
    } catch (error: any) {
      console.error("❌ Error creating vector store:", error);
      throw new Error(`Failed to create vector store: ${error.message}`);
    }
  }

  /**
   * Retrieve relevant chunks from the vector store using semantic similarity
   */
  async retrieveRelevantChunks(
    query: string,
    k: number = 3
  ): Promise<string[]> {
    if (!this.vectorStore) {
      throw new Error(
        "Vector store not initialized. Call createVectorStore first."
      );
    }

    try {
      const relevantDocs = await this.vectorStore.similaritySearch(query, k);
      const chunks = relevantDocs.map((doc) => doc.pageContent);

      console.log(
        `🔍 Retrieved ${
          chunks.length
        } relevant chunks for query: "${query.substring(0, 50)}..."`
      );
      return chunks;
    } catch (error: any) {
      console.error("❌ Error retrieving chunks:", error);
      throw new Error(`Failed to retrieve chunks: ${error.message}`);
    }
  }

  /**
   * Get context from vector store for RAG
   */
  async getRAGContext(query: string, k: number = 3): Promise<string> {
    try {
      const relevantChunks = await this.retrieveRelevantChunks(query, k);
      const context = relevantChunks.join("\n\n---\n\n");

      console.log(`📚 RAG Context prepared (${context.length} characters)`);
      return context;
    } catch (error: any) {
      console.error("❌ Error getting RAG context:", error);
      throw new Error(`Failed to get RAG context: ${error.message}`);
    }
  }

  /**
   * Clear the vector store
   */
  clearVectorStore(): void {
    this.vectorStore = null;
    console.log("🗑️  Vector store cleared");
  }

  /**
   * Check if vector store is initialized
   */
  isInitialized(): boolean {
    return this.vectorStore !== null;
  }
}

export default new RAGService();
