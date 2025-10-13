import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { AppError } from "@utils/errors/AppError";
import { logger } from "@utils/logger";
import { isProduction } from "@config/index";

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  // Log all errors
  logger.error(
    {
      err,
      req: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
    },
    "Request error"
  );

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: "error",
      message: "Validation failed",
      errors: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.context && { context: err.context }),
      ...(!isProduction && { stack: err.stack }),
    });
  }

  // Unknown errors - don't leak details in production
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: isProduction ? "Internal server error" : err.message,
    ...(!isProduction && { stack: err.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: "error",
    message: `Route ${req.method} ${req.path} not found`,
  });
};
