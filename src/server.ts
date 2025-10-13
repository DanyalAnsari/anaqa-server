import { createApp } from "./app";
import { config, isProduction } from "@config/index";
<<<<<<< HEAD
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
      logger.error({ err: reason }, "Unhandled Rejection");
      if (!isProduction) {
        process.exit(1);
      }
    });

    process.on("uncaughtException", (error: Error) => {
      logger.error({ err: error }, "Uncaught Exception");
      process.exit(1);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
}
=======
import { logger } from "@utils/logger";

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
const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, "Received shutdown signal");

  server.close(() => {
    logger.info("HTTP server closed");

    // Close database connections, etc.
    // await db.disconnect();

    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};
>>>>>>> 3f38b03 (Resolve merge conflicts)

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled rejections
process.on("unhandledRejection", (reason: Error) => {
  logger.error({ err: reason }, "Unhandled Rejection");
  if (!isProduction) {
    process.exit(1);
  }
});

process.on("uncaughtException", (error: Error) => {
  logger.error({ err: error }, "Uncaught Exception");
  process.exit(1);
});

export default server;
