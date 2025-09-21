import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import summaryRoutes from "./routes/summary.routes";

const app = express();

// Trust proxy for rate limiting (needed to get real IP addresses)
app.set("trust proxy", 1);

// Custom middleware to sanitize JSON before parsing
const sanitizeJsonMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.headers["content-type"]?.includes("application/json")) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        // Sanitize the JSON string
        const sanitizedBody = body
          .replace(/[""]/g, '"') // Replace smart quotes
          .replace(/['']/g, "'") // Replace smart apostrophes
          .replace(/[—–]/g, "-") // Replace em/en dashes
          .replace(/[…]/g, "...") // Replace ellipsis
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remove control characters

        // Parse the sanitized JSON
        req.body = JSON.parse(sanitizedBody);
        next();
      } catch (error) {
        res.status(400).json({
          error: "Invalid JSON",
          message: "The request body contains invalid JSON format",
        });
      }
    });
  } else {
    next();
  }
};

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Custom JSON sanitization middleware (before express.json)
app.use(sanitizeJsonMiddleware);

// Body parsing middleware for non-JSON content
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Summary Bot Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/v1/summary", summaryRoutes);

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    if (error.type === "entity.too.large") {
      return res.status(413).json({
        error: "File too large",
        message: "The uploaded file exceeds the maximum size limit",
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message:
        config.nodeEnv === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist",
  });
});

export default app;
