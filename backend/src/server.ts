import app from "./app";
import { config } from "./config";

const server = app.listen(config.port, () => {
  console.log(`🚀 Summary Bot Backend is running on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${config.port}/api/health`);
});

// Graceful shutdown
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

export default server;
