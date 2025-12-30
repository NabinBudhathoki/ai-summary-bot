import { Request, Response } from "express";
import langChainOpenAIService from "../services/langchain.openai.service";
import ragService from "../services/rag.service";
import { UrlFetcherService } from "../services/urlFetcher.service";

/**
 * Helper function to sanitize and preprocess text
 */
function sanitizeAndPreprocessText(text: string): string {
  let sanitizedText = text
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  const sentences = sanitizedText.split(/[.!?]+/);
  let processedText = "";
  let currentParagraph = "";

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length === 0) continue;

    currentParagraph += sentence;
    if (i < sentences.length - 1) {
      currentParagraph += ". ";
    }
  }

  return (processedText + currentParagraph).trim();
}

/**
 * Generate text summary using LangChain (with optional RAG)
 * POST /api/v1/summary/text
 */
export const generateTextSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      text,
      summaryType = "summary",
      format = "paragraph",
      length = "medium",
      useRAG = true, // New parameter to enable RAG
    } = req.body;

    const MAX_INPUT_LENGTH = 10000; // or another appropriate value

    // Validation
    if (!text || typeof text !== "string") {
      res.status(400).json({
        error: "Invalid input",
        message: "Text content is required and must be a string",
      });
      return;
    }

    if (text.trim().length === 0) {
      res.status(400).json({
        error: "Invalid input",
        message: "Text content cannot be empty",
      });
      return;
    }

    if (text.length > MAX_INPUT_LENGTH) {
      res.status(400).json({
        error: "Input too long",
        message: `Text content exceeds the maximum allowed length of ${MAX_INPUT_LENGTH} characters.`,
      });
      return;
    }

    const validFormats = ["paragraph", "bullets", "insights", "themes"];
    const validLengths = ["short", "medium", "long"];

    if (!validFormats.includes(format)) {
      res.status(400).json({
        error: "Invalid format",
        message: "Format must be one of: paragraph, bullets, insights, themes",
      });
      return;
    }

    if (!validLengths.includes(length)) {
      res.status(400).json({
        error: "Invalid length",
        message: "Length must be one of: short, medium, long",
      });
      return;
    }

    // Process text
    const processedText = sanitizeAndPreprocessText(text);
    console.log("Processed Text Length:", processedText.length);

    // Generate summary based on RAG flag
    let summary: string;
    if (useRAG) {
      console.log("🔄 Using RAG-enhanced summarization");
      summary = await langChainOpenAIService.generateSummaryWithRAG(
        processedText,
        summaryType,
        format,
        length
      );
    } else {
      console.log("📝 Using standard LangChain summarization");
      summary = await langChainOpenAIService.generateSummary(
        processedText,
        summaryType,
        format,
        length
      );
    }

    res.json({
      success: true,
      summary,
      summaryType,
      format,
      length,
      useRAG,
      originalLength: text.length,
      summaryLength: summary.length,
      engine: useRAG ? "LangChain + RAG" : "LangChain",
    });
  } catch (error: any) {
    console.error("Text summary generation error:", error);

    if (error.message.includes("API key")) {
      res.status(401).json({
        error: "Authentication failed",
        message: "OpenAI API key is not configured properly",
      });
      return;
    }

    res.status(500).json({
      error: "Summary generation failed",
      message:
        error.message || "An error occurred while generating the summary",
    });
  }
};

/**
 * Generate URL summary using LangChain (with optional RAG)
 * POST /api/v1/summary/url
 */
export const generateUrlSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      url,
      summaryType = "summary",
      format = "paragraph",
      length = "medium",
      useRAG = true, // New parameter to enable RAG
    } = req.body;

    // Validation
    if (!url || typeof url !== "string") {
      res.status(400).json({
        error: "Invalid input",
        message: "URL is required and must be a string",
      });
      return;
    }

    const validFormats = ["paragraph", "bullets", "insights", "themes"];
    const validLengths = ["short", "medium", "long"];

    if (!validFormats.includes(format)) {
      res.status(400).json({
        error: "Invalid format",
        message: "Format must be one of: paragraph, bullets, insights, themes",
      });
      return;
    }

    if (!validLengths.includes(length)) {
      res.status(400).json({
        error: "Invalid length",
        message: "Length must be one of: short, medium, long",
      });
      return;
    }

    // Fetch content from URL
    console.log("Fetching content from URL:", url);
    const urlContent = await UrlFetcherService.fetchUrlContent(url);

    if (
      !urlContent ||
      !urlContent.content ||
      urlContent.content.trim().length === 0
    ) {
      res.status(400).json({
        error: "Failed to fetch content",
        message: "Could not extract content from the provided URL",
      });
      return;
    }

    // Process text
    const processedText = sanitizeAndPreprocessText(urlContent.content);
    console.log("URL Content Length:", processedText.length);

    // Generate summary based on RAG flag
    let summary: string;
    if (useRAG) {
      console.log("🔄 Using RAG-enhanced summarization for URL content");
      summary = await langChainOpenAIService.generateSummaryWithRAG(
        processedText,
        summaryType,
        format,
        length
      );
    } else {
      console.log("📝 Using standard LangChain summarization for URL content");
      summary = await langChainOpenAIService.generateSummary(
        processedText,
        summaryType,
        format,
        length
      );
    }

    res.json({
      success: true,
      summary,
      url,
      summaryType,
      format,
      length,
      useRAG,
      originalLength: urlContent.content.length,
      summaryLength: summary.length,
      engine: useRAG ? "LangChain + RAG" : "LangChain",
    });
  } catch (error: any) {
    console.error("URL summary generation error:", error);

    if (error.message.includes("API key")) {
      res.status(401).json({
        error: "Authentication failed",
        message: "OpenAI API key is not configured properly",
      });
      return;
    }

    if (error.message.includes("fetch")) {
      res.status(400).json({
        error: "URL fetch failed",
        message:
          "Failed to fetch content from the URL. Please check the URL and try again.",
      });
      return;
    }

    res.status(500).json({
      error: "Summary generation failed",
      message:
        error.message || "An error occurred while generating the summary",
    });
  }
};
