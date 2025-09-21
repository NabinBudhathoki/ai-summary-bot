"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("./config");
const summary_routes_1 = __importDefault(require("./routes/summary.routes"));
const app = (0, express_1.default)();
app.set("trust proxy", 1);
const sanitizeJsonMiddleware = (req, res, next) => {
    if (req.headers["content-type"]?.includes("application/json")) {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const sanitizedBody = body
                    .replace(/[""]/g, '"')
                    .replace(/['']/g, "'")
                    .replace(/[—–]/g, "-")
                    .replace(/[…]/g, "...")
                    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
                req.body = JSON.parse(sanitizedBody);
                next();
            }
            catch (error) {
                res.status(400).json({
                    error: "Invalid JSON",
                    message: "The request body contains invalid JSON format",
                });
            }
        });
    }
    else {
        next();
    }
};
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(config_1.config.cors));
app.use(sanitizeJsonMiddleware);
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Summary Bot Backend is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});
app.use("/api/v1/summary", summary_routes_1.default);
app.use((error, req, res, next) => {
    console.error("Global error handler:", error);
    if (error.type === "entity.too.large") {
        return res.status(413).json({
            error: "File too large",
            message: "The uploaded file exceeds the maximum size limit",
        });
    }
    return res.status(500).json({
        error: "Internal Server Error",
        message: config_1.config.nodeEnv === "development"
            ? error.message
            : "Something went wrong",
    });
});
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "The requested endpoint does not exist",
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map