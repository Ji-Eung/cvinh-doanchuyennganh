import { Request, Response } from "express";
import { Rating } from "./rating.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { User } from "../users/user.model.js";
import {
  created,
  unauthorized,
  badRequest,
  notFound,
  forbidden,
  conflict,
} from "../../utils/response.js";

export async function createRating(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { transactionId, score, comment } =
    (req as any).validatedBody || req.body;
  const tx = await Transaction.findById(transactionId);
  if (!tx) return notFound(res, "Transaction not found");
  // Only buyer can rate seller (MVP rule) – có thể mở rộng sau.
  if (String(tx.buyerId) !== req.user.sub) return forbidden(res, "Not allowed");
  const existing = await Rating.findOne({
    transactionId,
    raterId: req.user.sub,
  });
  if (existing) return conflict(res, "Already rated");
  const targetUserId = tx.sellerId;
  const doc = await Rating.create({
    transactionId,
    raterId: req.user.sub,
    targetUserId,
    score,
    comment,
  });
  // Aggregate update on user (denormalize for quick average)
  await User.updateOne(
    { _id: targetUserId },
    { $inc: { ratingsCount: 1, ratingsTotal: score } }
  );
  return created(res, { id: doc.id });
}
