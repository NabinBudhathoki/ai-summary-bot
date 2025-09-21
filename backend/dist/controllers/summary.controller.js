"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUrlSummary = exports.generateTextSummary = void 0;
const openai_service_1 = __importDefault(require("../services/openai.service"));
const urlFetcher_service_1 = require("../services/urlFetcher.service");
function sanitizeAndPreprocessText(text) {
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
        if (sentence.length === 0)
            continue;
        currentParagraph += sentence;
        if (i < sentences.length - 1) {
            currentParagraph += ". ";
        }
        const nextSentence = sentences[i + 1]?.trim();
        if (nextSentence &&
            (currentParagraph.length > 200 ||
                /^[A-Z][a-z]+ [A-Z]/.test(nextSentence) ||
                /^(As|When|While|During|After|Before|Meanwhile|However|Moreover|Furthermore|Additionally|In contrast|On the other hand)/.test(nextSentence))) {
            processedText += currentParagraph + "\n\n";
            currentParagraph = "";
        }
    }
    if (currentParagraph.trim()) {
        processedText += currentParagraph;
    }
    return processedText.trim();
}
const generateTextSummary = async (req, res) => {
    try {
        const { text, summaryType = "summary", format = "paragraph", length = "medium", } = req.body;
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
        const processedText = sanitizeAndPreprocessText(text);
        const summary = await openai_service_1.default.generateSummary(processedText, summaryType, format, length);
        res.json({
            success: true,
            summary,
            summaryType,
            format,
            length,
            originalLength: text.length,
            summaryLength: summary.length,
        });
    }
    catch (error) {
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
            message: error.message || "An error occurred while generating the summary",
        });
    }
};
exports.generateTextSummary = generateTextSummary;
const generateUrlSummary = async (req, res) => {
    try {
        const { url, summaryType = "summary", format = "paragraph", length = "medium", } = req.body;
        if (!url || typeof url !== "string") {
            res.status(400).json({
                error: "Invalid input",
                message: "URL is required and must be a string",
            });
            return;
        }
        const urlValidation = urlFetcher_service_1.UrlFetcherService.validateUrl(url);
        if (!urlValidation.isValid) {
            res.status(400).json({
                error: "Invalid URL",
                message: urlValidation.error,
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
        let urlContent;
        try {
            urlContent = await urlFetcher_service_1.UrlFetcherService.fetchUrlContent(url);
        }
        catch (fetchError) {
            res.status(400).json({
                error: "URL fetch failed",
                message: fetchError.message || "Unable to fetch content from the provided URL",
            });
            return;
        }
        const processedContent = sanitizeAndPreprocessText(urlContent.content);
        const summary = await openai_service_1.default.generateSummary(processedContent, summaryType, format, length);
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
    }
    catch (error) {
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
exports.generateUrlSummary = generateUrlSummary;
//# sourceMappingURL=summary.controller.js.map