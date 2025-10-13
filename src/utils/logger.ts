import pino from "pino";
import { config, isDevelopment } from "@config/index";

// Create logger instance
export const logger = pino({
  level: config.LOG_LEVEL,

  // Development: pretty print; Production: JSON
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  // Add context to all logs
  base: {
    env: config.NODE_ENV,
  },

  // Redact sensitive data
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true,
  },
});
