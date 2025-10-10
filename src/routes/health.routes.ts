import { healthCheck } from "@/controllers/health.controller";
import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/", healthCheck);

export default healthRouter;
