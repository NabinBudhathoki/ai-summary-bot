import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { config } from "../config";
import ragService from "./rag.service";

class LangChainOpenAIService {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      configuration: {
        apiKey: config.openai.apiKey,
      },
      modelName: config.openai.model,
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  /**
   * Generate summary using LangChain with RAG
   */
  async generateSummaryWithRAG(
    text: string,
    summaryType: string = "summary",
    format: string = "paragraph",
    length: string = "medium"
  ): Promise<string> {
    try {
      console.log("🚀 Starting RAG-based summary generation...");

      // Step 1: Create vector store from text
      console.log("📝 Creating vector store...");
      await ragService.createVectorStore(text);

      // Step 2: Retrieve relevant context
      const query = this.buildQuery(summaryType, format, length);
      const ragContext = await ragService.getRAGContext(query, 3);

      // Step 3: Build prompt with RAG context
      const prompt = this.buildPromptWithRAG(
        summaryType,
        format,
        length,
        text,
        ragContext
      );

      // Step 4: Create LLM chain and execute
      const chain = new LLMChain({
        llm: this.llm,
        prompt: PromptTemplate.fromTemplate(prompt),
      });

      const result = await chain.call({});
      const summary = result.text || "Failed to generate summary";

      console.log("✅ Summary generated successfully with RAG");

      // Clear vector store after use
      ragService.clearVectorStore();

      return summary;
    } catch (error: any) {
      console.error("❌ RAG Summary Generation Error:", error);
      throw new Error(`Failed to generate RAG summary: ${error.message}`);
    }
  }

  /**
   * Generate summary using LangChain without RAG (standard approach)
   */
  async generateSummary(
    text: string,
    summaryType: string = "summary",
    format: string = "paragraph",
    length: string = "medium"
  ): Promise<string> {
    try {
      console.log("🚀 Starting LangChain summary generation...");

      const prompt = this.buildPrompt(summaryType, format, length, text);

      const chain = new LLMChain({
        llm: this.llm,
        prompt: PromptTemplate.fromTemplate(prompt),
      });

      const result = await chain.call({});
      const summary = result.text || "Failed to generate summary";

      console.log("✅ Summary generated successfully with LangChain");
      return summary;
    } catch (error: any) {
      console.error("❌ LangChain Summary Generation Error:", error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  /**
   * Build a query for RAG retrieval
   */
  private buildQuery(
    summaryType: string,
    format: string,
    length: string
  ): string {
    return `Generate a ${length} ${format} ${summaryType} focusing on key information`;
  }

  /**
   * Build prompt with RAG context
   * instruction-based prompt engineering.
   */
  private buildPromptWithRAG(
    summaryType: string,
    format: string,
    length: string,
    text: string,
    ragContext: string
  ): string {
    const basePrompt = `You are an expert at creating clear, concise, and comprehensive summaries.

Original Text:
{0}

Retrieved Relevant Context:
{1}

Using both the original text and the retrieved context, ${this.getFormatInstructions(
      format,
      length
    )}`;

    return basePrompt.replace("{0}", text).replace("{1}", ragContext);
  }

  /**
   * Build standard prompt without RAG
   */
  private buildPrompt(
    summaryType: string,
    format: string,
    length: string,
    text: string
  ): string {
    const basePrompt = `You are an expert at creating clear, concise, and comprehensive summaries.

Text to summarize:
{text}

${this.getFormatInstructions(format, length)}`;

    return basePrompt.replace("{text}", text);
  }

  /**
   * Get format-specific instructions
   */
  private getFormatInstructions(format: string, length: string): string {
    const getPointCount = () => {
      switch (length) {
        case "short":
          return format === "bullets" ? "3-5" : "2-3";
        case "long":
          return format === "bullets" ? "8-12" : "6-8";
        default:
          return format === "bullets" ? "5-8" : "4-6";
      }
    };

    const pointCount = getPointCount();

    switch (format.toLowerCase()) {
      case "bullets":
        return `Create a bullet-point summary with ${pointCount} key points. Format as:
• [Key point 1]
• [Key point 2]
• [Continue as needed]

Focus on the most important information.`;

      case "insights":
        return `Extract ${pointCount} key insights. Format as:
**Key Insights:**
• **[Insight Title]**: [Explanation]
• **[Insight Title]**: [Explanation]

Provide deep, thoughtful analysis.`;

      case "themes":
        return `Identify ${pointCount} main themes. Format as:
**Main Themes:**
• **[Theme Title]**: [Description]
• **[Theme Title]**: [Description]

Focus on overarching concepts.`;

      case "paragraph":
      default:
        const lengthGuide =
          length === "short"
            ? "Keep it concise (1-2 paragraphs)."
            : length === "long"
            ? "Provide a comprehensive summary (3-4 paragraphs)."
            : "Aim for a balanced summary (2-3 paragraphs).";

        return `${lengthGuide} Write in clear prose capturing the essence of the original text.`;
    }
  }
}

export default new LangChainOpenAIService();
