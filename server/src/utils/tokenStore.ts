import crypto from "crypto";
import { RefreshToken } from "../modules/auth/refreshToken.model.js";

// Hash refresh token using SHA-256 (bcrypt not necessary, we only need non-reversible lookup)
export function hashRefresh(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function persistRefreshToken(params: {
  userId: string;
  token: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}) {
  const { userId, token, expiresAt, userAgent, ip } = params;
  const tokenHash = hashRefresh(token);
  await RefreshToken.create({ userId, tokenHash, expiresAt, userAgent, ip });
}

export async function rotateRefreshToken(oldToken: string, newToken: string) {
  const oldHash = hashRefresh(oldToken);
  const doc = await RefreshToken.findOne({
    tokenHash: oldHash,
    revokedAt: { $exists: false },
  });
  if (!doc) return false;
  doc.revokedAt = new Date();
  doc.rotatedAt = new Date();
  await doc.save();
  return true;
}

export async function findRefreshToken(token: string) {
  const hash = hashRefresh(token);
  return RefreshToken.findOne({ tokenHash: hash });
}

export async function isRefreshTokenValid(token: string) {
  const hash = hashRefresh(token);
  const doc = await RefreshToken.findOne({ tokenHash: hash });
  if (!doc) return false;
  if (doc.revokedAt) return false;
  if (doc.expiresAt.getTime() < Date.now()) return false;
  return true;
}

export async function revokeToken(token: string) {
  const hash = hashRefresh(token);
  await RefreshToken.updateOne(
    { tokenHash: hash },
    { $set: { revokedAt: new Date() } }
  );
}

export async function revokeAllUserTokens(userId: string) {
  await RefreshToken.updateMany(
    { userId, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
}
