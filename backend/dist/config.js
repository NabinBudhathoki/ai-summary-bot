"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || "development",
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.AI_MODEL || "gpt-4.1-nano",
        embeddingModel: process.env.TEXT_EMBEDDING_MODEL || "text-embedding-ada-002",
    },
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"),
        uploadDir: process.env.UPLOAD_DIR || "uploads",
        allowedTypes: [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "text/markdown",
            "text/plain",
        ],
        allowedExtensions: [".pdf", ".png", ".jpg", ".jpeg", ".md", ".txt"],
    },
};
if (!exports.config.openai.apiKey) {
    throw new Error("OPENAI_API_KEY is required in environment variables");
}
//# sourceMappingURL=config.js.map