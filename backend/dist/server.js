"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const server = app_1.default.listen(config_1.config.port, () => {
    console.log(`🚀 Summary Bot Backend is running on port ${config_1.config.port}`);
    console.log(`📝 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${config_1.config.port}/api/health`);
});
process.on("SIGTERM", () => {
    console.log("📴 SIGTERM received, shutting down gracefully");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
});
process.on("SIGINT", () => {
    console.log("📴 SIGINT received, shutting down gracefully");
    server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
    });
});
exports.default = server;
//# sourceMappingURL=server.js.map