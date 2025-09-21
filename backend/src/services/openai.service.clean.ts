import OpenAI from "openai";
import { config } from "../config";

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async generateSummary(
    text: string,
    summaryType: string = "summary",
    format: string = "paragraph",
    length: string = "medium"
  ): Promise<string> {
    const prompt = this.getPromptForSummaryType(
      summaryType,
      text,
      format,
      length
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: "system",
            content:
              "You are an expert at creating clear, concise, and comprehensive summaries. Your responses should be well-structured and easy to understand.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content || "Failed to generate summary"
      );
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      throw new Error(`Failed to generate summary: ${error.message}`);
    }
  }

  private getPromptForSummaryType(
    type: string,
    text: string,
    format: string = "paragraph",
    length: string = "medium"
  ): string {
    const basePrompt = `Please analyze and summarize the following text:\n\n${text}\n\n`;

    // Define point counts based on length
    const getPointCount = () => {
      switch (length) {
        case "short":
          return format === "bullets" ? "3-5" : "2-3";
        case "long":
          return format === "bullets" ? "8-12" : "6-8";
        default: // medium
          return format === "bullets" ? "5-8" : "4-6";
      }
    };

    const pointCount = getPointCount();

    switch (format.toLowerCase()) {
      case "bullets":
        return (
          basePrompt +
          `Create a bullet-point summary with ${pointCount} key points. Each point should be concise but informative. Format your response as:
• [First key point]
• [Second key point]
• [Continue as needed]

Focus on the most important information and main ideas.`
        );

      case "insights":
        return (
          basePrompt +
          `Extract ${pointCount} key insights from this text. Focus on meaningful interpretations, conclusions, and important observations. Format your response as:
**Key Insights:**
• **[Insight Title]**: [Detailed explanation]
• **[Insight Title]**: [Detailed explanation]
• [Continue as needed]

Provide deep, thoughtful analysis rather than just factual summary.`
        );

      case "themes":
        return (
          basePrompt +
          `Identify ${pointCount} main themes or central ideas from this text. Focus on overarching concepts and recurring topics. Format your response as:
**Main Themes:**
• **[Theme Title]**: [Description of the theme and its significance]
• **[Theme Title]**: [Description of the theme and its significance]
• [Continue as needed]

Look for patterns, central messages, and conceptual frameworks.`
        );

      case "paragraph":
      default:
        const lengthGuide =
          length === "short"
            ? "Keep it concise (1-2 paragraphs)."
            : length === "long"
            ? "Provide a comprehensive summary (3-4 paragraphs)."
            : "Aim for a balanced summary (2-3 paragraphs).";

        return (
          basePrompt +
          `${lengthGuide} Focus on the main ideas, key arguments, and important details. Write in clear, flowing prose that captures the essence of the original text.`
        );
    }
  }
}

export default new OpenAIService();
