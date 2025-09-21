"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudyGuide = void 0;
const openai_service_1 = __importDefault(require("../services/openai.service"));
const fileParser_1 = require("../utils/fileParser");
const generateStudyGuide = async (req, res) => {
    try {
        const { type } = req.body;
        const file = req.file;
        console.log("Study guide generation request received:", {
            type,
            hasFile: !!file,
            filename: file?.originalname,
        });
        if (!file) {
            res.status(400).json({
                error: "No file uploaded",
                message: "Please upload a file to generate a study guide",
            });
            return;
        }
        if (!type) {
            res.status(400).json({
                error: "Study guide type not specified",
                message: "Please specify the type of study guide to generate",
            });
            return;
        }
        console.log("Starting file parsing...");
        let content;
        try {
            content = await (0, fileParser_1.parseFileContent)(file);
            console.log("File parsed successfully, content length:", content.length);
        }
        catch (parseError) {
            console.error("File parsing error:", parseError);
            res.status(400).json({
                error: "Failed to parse file content",
                message: "Please ensure the file is valid and readable.",
            });
            return;
        }
        if (!content || content.trim().length === 0) {
            res.status(400).json({
                error: "No readable content found in the file",
                message: "Please check if the file contains text.",
            });
            return;
        }
        content = (0, fileParser_1.truncateContent)(content);
        console.log("Generating study guide for type:", type);
        const studyGuideContent = await openai_service_1.default.generateStudyGuide(content, type);
        console.log("Study guide generated successfully");
        res.json({
            success: true,
            content: studyGuideContent,
            type: type,
            filename: file.originalname,
            originalContentLength: content.length,
        });
    }
    catch (error) {
        console.error("Study guide generation error:", error);
        if (error.status === 401) {
            res.status(401).json({
                error: "Invalid OpenAI API key",
                message: "Please check your API key and try again.",
            });
            return;
        }
        if (error.status === 403 || error.code === "model_not_found") {
            res.status(403).json({
                error: "Model access denied",
                message: "Your OpenAI API key does not have access to the required models.",
            });
            return;
        }
        if (error.status === 429) {
            res.status(429).json({
                error: "Rate limit exceeded",
                message: "OpenAI API rate limit exceeded. Please try again later.",
            });
            return;
        }
        if (error.status === 413) {
            res.status(413).json({
                error: "Content too large",
                message: "Please try with a smaller file.",
            });
            return;
        }
        if (error.message && error.message.includes("API key")) {
            res.status(401).json({
                error: "OpenAI API key issue",
                message: error.message,
            });
            return;
        }
        if (error.message && error.message.includes("parsing")) {
            res.status(400).json({
                error: "File parsing failed",
                message: error.message,
            });
            return;
        }
        res.status(500).json({
            error: "Study guide generation failed",
            message: error.message ||
                "An error occurred while generating the study guide. Please try again.",
        });
    }
};
exports.generateStudyGuide = generateStudyGuide;
//# sourceMappingURL=studyGuide.controller.js.map