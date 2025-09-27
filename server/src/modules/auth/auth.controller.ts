import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../users/user.model.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt.js";
import {
  persistRefreshToken,
  isRefreshTokenValid,
  rotateRefreshToken,
  revokeToken,
  hashRefresh,
  revokeAllUserTokens,
  findRefreshToken,
} from "../../utils/tokenStore.js";
import {
  ok,
  created,
  conflict,
  unauthorized,
  badRequest,
} from "../../utils/response.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const { name, email, password } = (req as any).validatedBody || req.body;
  const exists = await User.findOne({ email });
  if (exists) return conflict(res, "Email already registered");
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, email, passwordHash });
  return created(res, { id: user.id, name: user.name, email: user.email });
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export async function login(req: Request, res: Response) {
  const { email, password } = (req as any).validatedBody || req.body;
  const user = await User.findOne({ email });
  if (!user) return unauthorized(res, "Invalid credentials");
  const okPass = await comparePassword(password, user.passwordHash);
  if (!okPass) return unauthorized(res, "Invalid credentials");
  const accessToken = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id, user.role);
  await persistRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });
  return ok(res, {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl || null,
    },
  });
}

const refreshSchema = z.object({ refreshToken: z.string().min(10) });
export async function refresh(req: Request, res: Response) {
  const { refreshToken: rToken } = (req as any).validatedBody || req.body;
  try {
    const payload = verifyRefresh(rToken);
    if (payload.type !== "refresh") throw new Error("Invalid token type");
    const tokenDoc = await findRefreshToken(rToken);
    if (!tokenDoc) {
      // Possible reuse attempt: token missing (maybe already rotated & attacker using old one)
      await revokeAllUserTokens(payload.sub);
      return unauthorized(res, "Invalid refresh token (reuse suspected)");
    }
    if (tokenDoc.revokedAt) {
      // Reuse of revoked token -> revoke all
      await revokeAllUserTokens(payload.sub);
      return unauthorized(res, "Invalid refresh token (revoked)");
    }
    if (tokenDoc.expiresAt.getTime() < Date.now()) {
      return unauthorized(res, "Invalid refresh token (expired)");
    }
    const accessToken = signAccess(payload.sub, payload.role);
    const refreshToken = signRefresh(payload.sub, payload.role);
    await rotateRefreshToken(rToken, refreshToken);
    await persistRefreshToken({
      userId: payload.sub,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    return ok(res, { accessToken, refreshToken });
  } catch {
    return unauthorized(res, "Invalid refresh token");
  }
}

export async function logout(req: Request, res: Response) {
  const token = (req.headers.authorization || "").replace(/Bearer\s+/i, "");
  // Best effort: if client sends refresh token in body we revoke it; else ignore
  const { refreshToken } = (req as any).validatedBody || req.body || {};
  if (refreshToken) {
    await revokeToken(refreshToken);
  }
  return ok(res, { message: "Logged out" });
}
