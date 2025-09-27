import { Request, Response, NextFunction } from "express";
// Global type augmentations are declared in src/types/global.d.ts (no runtime import needed)
import { verifyAccess } from "../utils/jwt.js";

export function auth(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    let token: string | null = null;
    if (header) token = header.replace(/^[Bb]earer\s+/, "").trim();
    else if (req.query && typeof req.query.token === "string")
      token = req.query.token;
    if (!token) {
      if (required)
        return res
          .status(401)
          .json({ success: false, message: "Missing Authorization" });
      return next();
    }
    try {
      const payload = verifyAccess(token);
      if (payload.type !== "access") throw new Error("Invalid token type");
      req.user = { sub: payload.sub, role: payload.role };
      next();
    } catch (e: any) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  };
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthenticated" });
    if (req.user.role !== role)
      return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
}
