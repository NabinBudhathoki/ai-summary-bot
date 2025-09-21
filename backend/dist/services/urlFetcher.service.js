"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlFetcherService = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class UrlFetcherService {
    static async fetchUrlContent(url) {
        try {
            const urlObj = new URL(url);
            if (!["http:", "https:"].includes(urlObj.protocol)) {
                throw new Error("Only HTTP and HTTPS URLs are supported");
            }
            const response = await axios_1.default.get(url, {
                timeout: this.TIMEOUT,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
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
            const $ = cheerio.load(response.data);
            $("script, style, nav, header, footer, aside, .advertisement, .ads, .social-share").remove();
            let title = $("title").text().trim();
            if (!title) {
                title = $("h1").first().text().trim();
            }
            if (!title) {
                title = "Untitled Document";
            }
            let content = "";
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
                        break;
                    }
                }
            }
            if (!content || content.length < 100) {
                content = $("body").text().trim();
            }
            content = this.cleanContent(content);
            if (!content || content.length < 50) {
                throw new Error("Unable to extract meaningful content from the URL");
            }
            if (content.length > this.MAX_CONTENT_LENGTH) {
                content = content.substring(0, this.MAX_CONTENT_LENGTH) + "...";
            }
            return {
                title: title.substring(0, 200),
                content,
                url,
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === "ECONNABORTED") {
                    throw new Error("Request timeout - the website took too long to respond");
                }
                else if (error.response?.status === 404) {
                    throw new Error("URL not found (404)");
                }
                else if (error.response?.status === 403) {
                    throw new Error("Access forbidden (403) - the website blocks automated requests");
                }
                else if (error.response?.status === 429) {
                    throw new Error("Rate limit exceeded (429) - please try again later");
                }
                else if (error.response?.status && error.response.status >= 400) {
                    throw new Error(`HTTP error ${error.response.status}: ${error.response.statusText}`);
                }
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to fetch content from URL");
        }
    }
    static cleanContent(content) {
        return (content
            .replace(/\s+/g, " ")
            .replace(/\n\s*\n\s*\n/g, "\n\n")
            .trim());
    }
    static validateUrl(url) {
        try {
            const urlObj = new URL(url);
            if (!["http:", "https:"].includes(urlObj.protocol)) {
                return {
                    isValid: false,
                    error: "Only HTTP and HTTPS URLs are supported",
                };
            }
            const hostname = urlObj.hostname.toLowerCase();
            if (hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname.startsWith("192.168.") ||
                hostname.startsWith("10.") ||
                hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
                return {
                    isValid: false,
                    error: "Local and internal URLs are not allowed",
                };
            }
            return { isValid: true };
        }
        catch (error) {
            return {
                isValid: false,
                error: "Invalid URL format",
            };
        }
    }
}
exports.UrlFetcherService = UrlFetcherService;
UrlFetcherService.MAX_CONTENT_LENGTH = 50000;
UrlFetcherService.TIMEOUT = 10000;
//# sourceMappingURL=urlFetcher.service.js.map