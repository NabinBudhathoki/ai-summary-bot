import { Request, Response } from "express";
import openaiService from "../services/openai.service";
import { UrlFetcherService } from "../services/urlFetcher.service";

// Helper function to sanitize and preprocess text
function sanitizeAndPreprocessText(text: string): string {
  // First, sanitize the text by replacing problematic characters
  let sanitizedText = text
    // Replace smart quotes with regular quotes
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Replace em dashes and en dashes with regular hyphens
    .replace(/[—–]/g, "-")
    // Replace other problematic characters
    .replace(/[…]/g, "...")
    // Remove any other control characters
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  // Split text into sentences to identify potential paragraph breaks
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

    // Detect paragraph breaks based on content patterns
    // Look for topic shifts, proper nouns at sentence start, or length
    const nextSentence = sentences[i + 1]?.trim();
    if (
      nextSentence &&
      (currentParagraph.length > 200 || // Long paragraph
        /^[A-Z][a-z]+ [A-Z]/.test(nextSentence) || // Proper noun start
        /^(As|When|While|During|After|Before|Meanwhile|However|Moreover|Furthermore|Additionally|In contrast|On the other hand)/.test(
          nextSentence
        )) // Transition words
    ) {
      processedText += currentParagraph + "\n\n";
      currentParagraph = "";
    }
  }

  // Add the last paragraph
  if (currentParagraph.trim()) {
    processedText += currentParagraph;
  }

  return processedText.trim();
}

export const generateTextSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      text,
      summaryType = "summary",
      format = "paragraph", // paragraph, bullets, insights, themes
      length = "medium", // short, medium, long
    } = req.body;

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

    // Validate format and length parameters
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

    // Sanitize and preprocess text to handle problematic characters and paragraph breaks
    const processedText = sanitizeAndPreprocessText(text);

    const summary = await openaiService.generateSummary(
      processedText,
      summaryType,
      format,
      length
    );

    res.json({
      success: true,
      summary,
      summaryType,
      format,
      length,
      originalLength: text.length,
      summaryLength: summary.length,
    });
  } catch (error: any) {
    console.error("Text summary generation error:", error);

    if (error.message.includes("API key")) {
      res.status(401).json({
        error: "API key issue",
        message: error.message,
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

export const generateUrlSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      url,
      summaryType = "summary",
      format = "paragraph", // paragraph, bullets, insights, themes
      length = "medium", // short, medium, long
    } = req.body;

    if (!url || typeof url !== "string") {
      res.status(400).json({
        error: "Invalid input",
        message: "URL is required and must be a string",
      });
      return;
    }

    // Validate URL format and security
    const urlValidation = UrlFetcherService.validateUrl(url);
    if (!urlValidation.isValid) {
      res.status(400).json({
        error: "Invalid URL",
        message: urlValidation.error,
      });
      return;
    }

    // Validate format and length parameters
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

    // Fetch content from the URL
    let urlContent;
    try {
      urlContent = await UrlFetcherService.fetchUrlContent(url);
    } catch (fetchError: any) {
      res.status(400).json({
        error: "URL fetch failed",
        message:
          fetchError.message || "Unable to fetch content from the provided URL",
      });
      return;
    }

    // Process the content through the same sanitization as text summaries
    const processedContent = sanitizeAndPreprocessText(urlContent.content);

    // Generate summary using OpenAI
    const summary = await openaiService.generateSummary(
      processedContent,
      summaryType,
      format,
      length
    );

    res.json({
      success: true,
      summary,
      url,
      title: urlContent.title,
      summaryType,
      format,
      length,
      originalLength: urlContent.content.length,
      summaryLength: summary.length,
      metadata: {
        fetchedAt: new Date().toISOString(),
        contentPreview: urlContent.content.substring(0, 200) + "...",
      },
    });
  } catch (error: any) {
    console.error("URL summary generation error:", error);

    if (error.message.includes("API key")) {
      res.status(401).json({
        error: "API key issue",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "URL summary generation failed",
      message: error.message || "An error occurred while processing the URL",
    });
  }
};
