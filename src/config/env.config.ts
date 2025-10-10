import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

interface Config {
  env: string;
  port: number;
  corsOrigin: string;
  logLevel: string;
  apiPrefix: string;
  mongoUri: string;
  dbName: string;
}

const config: Config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3000", 10),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  logLevel: process.env.LOG_LEVEL || "info",
  apiPrefix: process.env.API_PREFIX || "/api",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/",
  dbName: process.env.DB_NAME || "Anaqa",
};

export default config;
