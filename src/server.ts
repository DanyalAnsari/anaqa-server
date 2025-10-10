import config from "./config/env.config";
import app from "./app";
import logger from "./utils/logger";
import { connectDatabase } from "./config/database.config";

const startServer = async () => {
  try {
    const PORT = config.port;
    // Connect to database
    await connectDatabase();

    // Start server

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🔗 URL: http://localhost:${config.port}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("unhandledRejection", (reason: Error) => {
      logger.error("Unhandled Rejection:", reason);
      throw reason;
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
