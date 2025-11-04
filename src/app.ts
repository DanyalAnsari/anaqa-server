import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config, isDevelopment } from "@config/index";
import routes from "@routes/index";
import { requestLogger } from "@middlewares/req.logger";
import { errorHandler, notFoundHandler } from "./middlewares/error.handler";

export const createApp = (): Application => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: isDevelopment
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          },
    })
  );

  // CORS
  app.use(
    cors({
      origin: isDevelopment ? "*" : config.CORS_ORIGIN,
      credentials: isDevelopment ? false : true,
    })
  );

  // Body parsing with size limits
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging
  app.use(requestLogger);

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests, please try again later",
    skip: (req) => {
      return req.path === "/health";
    },
  });
  app.use("/api", limiter);

  // Health check
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use("/api", routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};
