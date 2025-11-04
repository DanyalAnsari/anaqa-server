import { createApp } from "./app";
import { config, isProduction } from "@config/index";
import { logger } from "@/shared/utils/logger";
import { db } from "@/database/connection";

async function startServer() {
  try {
    // Connect to database first
    await db.connect();
    const app = createApp();
    const server = app.listen(config.PORT, () => {
      logger.info(
        {
          port: config.PORT,
          env: config.NODE_ENV,
          nodeVersion: process.version,
        },
        "🚀 Server started successfully"
      );
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info({ signal }, "Received shutdown signal");
      server.close(async () => {
        logger.info("HTTP server closed");
        // Disconnect from database
        await db.disconnect();
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("unhandledRejection", (reason: Error) => {
      logger.error({ err: reason }, "Unhandled Rejection")});;
    process.on("unhandledRejection", (reason: Error) => {
      logger.error({ err: reason }, "Unhandled Rejection");
      if (!isProduction) {
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}

startServer();
