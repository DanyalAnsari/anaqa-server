import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import config from "./config/env.config";
import { errorHandler } from "./middlewares/error.handler";
import { requestLogger } from "./middlewares/req.logger";
import router from "./routes";

const app: Application = express();

app.use(helmet());

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api", limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (config.env === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

app.use("/api", router);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use("/*SPLAT", (_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
