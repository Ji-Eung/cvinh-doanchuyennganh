// Central place for global type augmentations
import type { Request } from "express";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      MONGO_URI?: string;
      JWT_ACCESS_SECRET?: string;
      JWT_REFRESH_SECRET?: string;
      CORS_ORIGINS?: string;
      NODE_ENV?: "development" | "production" | "test";
    }
  }
  namespace Express {
    interface UserPayload {
      sub: string;
      role?: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
