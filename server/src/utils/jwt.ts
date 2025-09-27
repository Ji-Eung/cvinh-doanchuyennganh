import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const cfg = env();

export interface JwtPayloadBase {
  sub: string;
  role: string;
  type: "access" | "refresh";
}

export function signAccess(sub: string, role: string) {
  return jwt.sign({ sub, role, type: "access" }, cfg.accessSecret, {
    expiresIn: "15m",
  });
}

export function signRefresh(sub: string, role: string) {
  return jwt.sign({ sub, role, type: "refresh" }, cfg.refreshSecret, {
    expiresIn: "7d",
  });
}

export function verifyAccess(token: string): JwtPayloadBase {
  return jwt.verify(token, cfg.accessSecret) as JwtPayloadBase;
}

export function verifyRefresh(token: string): JwtPayloadBase {
  return jwt.verify(token, cfg.refreshSecret) as JwtPayloadBase;
}
