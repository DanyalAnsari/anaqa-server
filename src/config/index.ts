import { z } from "zod";
import dotenv from "dotenv";

// Load env before validation
dotenv.config();

// Schema-based validation - fail fast if config is wrong
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).pipe(z.number().positive()).default(3000),

<<<<<<< HEAD
  // MongoDB - required in production
  DB_URI: z.string().min(1, "MongoDB URI is required"),
  DB_NAME: z.string().optional(),
=======
  // Database
  DATABASE_URL: z.string().url().optional(),
>>>>>>> 3f38b03 (Resolve merge conflicts)

  // Redis
  REDIS_URL: z.string().url().optional(),

<<<<<<< HEAD
  // JWT Secrets - CRITICAL: Use strong, random secrets in production
  JWT_ACCESS_SECRET: z.string().min(32, "JWT access secret must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT refresh secret must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Email verification & password reset
  JWT_EMAIL_SECRET: z.string().min(32),
  JWT_EMAIL_EXPIRES_IN: z.string().default("1h"),
  JWT_RESET_SECRET: z.string().min(32),
  JWT_RESET_EXPIRES_IN: z.string().default("15m"),

  // Email configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Frontend URL (for email links)
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Auth Security
  BCRYPT_ROUNDS: z.string().transform(Number).default(12),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default(5),
  LOCK_TIME: z.string().transform(Number).default(7200000),

=======
>>>>>>> 3f38b03 (Resolve merge conflicts)
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
