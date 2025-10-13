import mongoose from "mongoose";
import { config, isDevelopment } from "@config/index";
import { logger } from "@utils/logger";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected = false;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.warn("Database already connected");
      return;
    }

    try {
      // Mongoose configuration
      mongoose.set("strictQuery", true); // Prepare for Mongoose 7

      const options: mongoose.ConnectOptions = {
        dbName: config.DB_NAME,
        maxPoolSize: 10,
        minPoolSize: 5,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 10000,
        // Useful for debugging in development
        autoIndex: isDevelopment, // Don't build indexes in production
      };

      await mongoose.connect(config.DB_URI, options);

      this.isConnected = true;

      logger.info(
        {
          host: mongoose.connection.host,
          name: mongoose.connection.name,
        },
        "✅ MongoDB connected successfully"
      );

      // Handle connection events
      this.setupEventHandlers();
    } catch (error) {
      logger.error({ err: error }, "❌ MongoDB connection failed");
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoDB disconnected");
    } catch (error) {
      logger.error({ err: error }, "Error disconnecting from MongoDB");
      throw error;
    }
  }

  private setupEventHandlers(): void {
    mongoose.connection.on("error", (error) => {
      logger.error({ err: error }, "MongoDB connection error");
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
      this.isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  getConnection(): typeof mongoose {
    return mongoose;
  }

  isHealthy(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export const db = DatabaseConnection.getInstance();
