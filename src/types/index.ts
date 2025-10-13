import { Request } from 'express';

// Extend Express Request with custom properties
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination helpers
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export const getPagination = (page: number = 1, limit: number = 10): PaginationParams => {
  const sanitizedPage = Math.max(1, page);
  const sanitizedLimit = Math.min(100, Math.max(1, limit));
  
  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    offset: (sanitizedPage - 1) * sanitizedLimit,
  };
};