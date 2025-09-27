import { Request, Response } from "express";
import { Rating } from "./rating.model.js";
import { ok, badRequest } from "../../utils/response.js";

export async function listUserRatings(req: Request, res: Response) {
  const { userId } = req.params;
  if (!userId) return badRequest(res, "userId required");
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const ratings = await Rating.find({ targetUserId: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("score comment raterId createdAt")
    .lean();
  return ok(res, ratings);
}
