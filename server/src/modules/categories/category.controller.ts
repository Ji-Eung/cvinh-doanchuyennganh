import { Request, Response } from "express";
import { Category, ensureCategorySeed } from "./category.model.js";
import { ok } from "../../utils/response.js";
import crypto from "crypto";

// Simple in-memory cache (process lifetime). Could later swap to Redis.
let categoryCache: { data: any[]; expiresAt: number; etag: string } | null =
  null;
const CATEGORY_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function listCategories(req: Request, res: Response) {
  await ensureCategorySeed();
  const now = Date.now();
  if (categoryCache && categoryCache.expiresAt > now) {
    if (req.headers["if-none-match"] === categoryCache.etag) {
      return res.status(304).end();
    }
    res.setHeader("ETag", categoryCache.etag);
    return ok(res, categoryCache.data, {
      cached: true,
      ttlMs: categoryCache.expiresAt - now,
    });
  }
  const categories = await Category.find()
    .select("name slug")
    .sort({ name: 1 })
    .lean();
  const hash = crypto
    .createHash("sha1")
    .update(JSON.stringify(categories))
    .digest("hex");
  const etag = 'W/"' + hash + '"';
  categoryCache = { data: categories, expiresAt: now + CATEGORY_TTL_MS, etag };
  res.setHeader("ETag", etag);
  return ok(res, categories, { cached: false, ttlMs: CATEGORY_TTL_MS });
}
