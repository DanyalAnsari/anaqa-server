import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public readonly isOperational: boolean = true,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types - makes handling easier
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, StatusCodes.BAD_REQUEST, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, StatusCodes.NOT_FOUND, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, StatusCodes.UNAUTHORIZED, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, StatusCodes.FORBIDDEN, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, StatusCodes.CONFLICT, true, context);
  }
}
