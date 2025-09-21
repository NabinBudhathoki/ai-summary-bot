"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSimilar = exports.detectAIText = void 0;
const openai_service_1 = __importDefault(require("../services/openai.service"));
const detectAIText = async (req, res) => {
    try {
        const { text } = req.body;
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
        if (text.length < 50) {
            res.status(400).json({
                error: "Text too short",
                message: "Please provide at least 50 characters for accurate detection",
            });
            return;
        }
        const result = await openai_service_1.default.detectAIText(text);
        res.json({
            success: true,
            likely_ai: result.likely_ai,
            confidence: result.confidence,
            rationale: result.rationale,
            text_length: text.length,
        });
    }
    catch (error) {
        console.error("AI text detection error:", error);
        if (error.message.includes("API key")) {
            res.status(401).json({
                error: "API key issue",
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            error: "AI detection failed",
            message: error.message || "An error occurred while detecting AI text",
        });
    }
};
exports.detectAIText = detectAIText;
const searchSimilar = async (req, res) => {
    try {
        const { query } = req.body;
        if (!query || typeof query !== "string") {
            res.status(400).json({
                error: "Invalid input",
                message: "Query is required and must be a string",
            });
            return;
        }
        res.json({
            success: true,
            message: "Similarity search feature coming soon",
            query,
            results: [],
        });
    }
    catch (error) {
        console.error("Similarity search error:", error);
        res.status(500).json({
            error: "Similarity search failed",
            message: error.message || "An error occurred during similarity search",
        });
    }
};
exports.searchSimilar = searchSimilar;
//# sourceMappingURL=aiDetection.controller.js.map