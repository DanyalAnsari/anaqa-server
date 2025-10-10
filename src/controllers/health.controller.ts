import { getHealthStatus } from "@/services/health.services";
import { Request, Response, NextFunction } from "express";

export const healthCheck = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const healthStatus = await getHealthStatus();
    res.status(200).json(healthStatus);
  } catch (error) {
    next(error);
  }
};
