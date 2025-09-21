import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.AI_MODEL || "gpt-4.1-nano",
    embeddingModel:
      process.env.TEXT_EMBEDDING_MODEL || "text-embedding-ada-002",
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB
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

// Validate required environment variables
if (!config.openai.apiKey) {
  throw new Error("OPENAI_API_KEY is required in environment variables");
}
