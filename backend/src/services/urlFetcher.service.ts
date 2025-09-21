import axios from "axios";
import * as cheerio from "cheerio";

export interface UrlContent {
  title: string;
  content: string;
  url: string;
}

export class UrlFetcherService {
  private static readonly MAX_CONTENT_LENGTH = 50000; // Limit content to avoid token limits
  private static readonly TIMEOUT = 10000; // 10 seconds timeout

  static async fetchUrlContent(url: string): Promise<UrlContent> {
    try {
      // Validate URL format
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new Error("Only HTTP and HTTPS URLs are supported");
      }

      // Fetch the HTML content
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 400,
      });

      if (!response.data) {
        throw new Error("No content received from URL");
      }

      // Parse HTML content
      const $ = cheerio.load(response.data);

      // Remove script and style elements
      $(
        "script, style, nav, header, footer, aside, .advertisement, .ads, .social-share"
      ).remove();

      // Extract title
      let title = $("title").text().trim();
      if (!title) {
        title = $("h1").first().text().trim();
      }
      if (!title) {
        title = "Untitled Document";
      }

      // Extract main content
      let content = "";

      // Try to find main content areas
      const contentSelectors = [
        "main",
        "article",
        ".content",
        ".post-content",
        ".entry-content",
        ".article-content",
        ".post-body",
        "#content",
        ".main-content",
        '[role="main"]',
      ];

      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > 100) {
            // Ensure we have substantial content
            break;
          }
        }
      }

      // Fallback to body content if no specific content area found
      if (!content || content.length < 100) {
        content = $("body").text().trim();
      }

      // Clean up the content
      content = this.cleanContent(content);

      if (!content || content.length < 50) {
        throw new Error("Unable to extract meaningful content from the URL");
      }

      // Limit content length to avoid token limits
      if (content.length > this.MAX_CONTENT_LENGTH) {
        content = content.substring(0, this.MAX_CONTENT_LENGTH) + "...";
      }

      return {
        title: title.substring(0, 200), // Limit title length
        content,
        url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error(
            "Request timeout - the website took too long to respond"
          );
        } else if (error.response?.status === 404) {
          throw new Error("URL not found (404)");
        } else if (error.response?.status === 403) {
          throw new Error(
            "Access forbidden (403) - the website blocks automated requests"
          );
        } else if (error.response?.status === 429) {
          throw new Error("Rate limit exceeded (429) - please try again later");
        } else if (error.response?.status && error.response.status >= 400) {
          throw new Error(
            `HTTP error ${error.response.status}: ${error.response.statusText}`
          );
        }
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to fetch content from URL");
    }
  }

  private static cleanContent(content: string): string {
    return (
      content
        // Replace multiple whitespace characters with single space
        .replace(/\s+/g, " ")
        // Remove extra newlines but preserve paragraph structure
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        // Trim whitespace
        .trim()
    );
  }

  static validateUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);

      if (!["http:", "https:"].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: "Only HTTP and HTTPS URLs are supported",
        };
      }

      // Block localhost and internal IPs for security
      const hostname = urlObj.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)
      ) {
        return {
          isValid: false,
          error: "Local and internal URLs are not allowed",
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: "Invalid URL format",
      };
    }
  }
}
