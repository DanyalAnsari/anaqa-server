import { z } from "zod";
import dotenv from "dotenv";

// Load env before validation
dotenv.config();

// Schema-based validation - fail fast if config is wrong
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default(3000),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Security
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // Logging
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // Feature Flags
  ENABLE_SWAGGER: z
    .string()
    .transform((val) => val === "true")
    .default(false),
});

// Validate and export
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ Invalid environment variables:", parseResult.error.format());
  process.exit(1);
}

export const config = parseResult.data;

// Type-safe config object
export type Config = z.infer<typeof envSchema>;

// Helper to check environment
export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";
