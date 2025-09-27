import { Request, Response } from "express";
import { Transaction } from "./transaction.model.js";
import { Post } from "../posts/post.model.js";
import {
  created,
  unauthorized,
  badRequest,
  notFound,
  conflict,
  ok,
  forbidden,
} from "../../utils/response.js";
import { Rating } from "../ratings/rating.model.js";
import { notify } from "../notifications/notification.model.js";

export async function createTransaction(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { postId } = (req as any).validatedBody || req.body;
  const post = await Post.findById(postId);
  if (!post) return notFound(res, "Post not found");
  if (String(post.sellerId) === req.user.sub)
    return badRequest(res, "Cannot buy own post");
  if (post.status !== "approved") return badRequest(res, "Post not available");
  const existing = await Transaction.findOne({ postId, buyerId: req.user.sub });
  if (existing) return conflict(res, "Transaction already exists");
  const tx = await Transaction.create({
    postId,
    buyerId: req.user.sub,
    sellerId: post.sellerId,
    priceAtSale: post.price,
  });
  notify(post.sellerId, "tx.created", "Có giao dịch mới cho bài đăng", {
    transactionId: tx.id,
    postId,
  });
  notify(req.user.sub, "tx.created", "Bạn đã tạo giao dịch", {
    transactionId: tx.id,
    postId,
  });
  // (Tuỳ chọn) đánh dấu post sold khi completed sau này; tạm thời giữ nguyên trạng thái.
  return created(res, { id: tx.id });
}

export async function listMyTransactions(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const txs = await Transaction.find({
    $or: [{ buyerId: req.user.sub }, { sellerId: req.user.sub }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .select("postId buyerId sellerId priceAtSale status createdAt updatedAt")
    .lean();
  return ok(
    res,
    txs.map((t) => ({
      id: t._id,
      postId: t.postId,
      buyerId: t.buyerId,
      sellerId: t.sellerId,
      priceAtSale: t.priceAtSale,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }))
  );
}

export async function getTransaction(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const tx: any = await Transaction.findById(req.params.id).lean();
  if (!tx) return notFound(res, "Transaction not found");
  if (
    String(tx.buyerId) !== req.user.sub &&
    String(tx.sellerId) !== req.user.sub
  )
    return forbidden(res, "Not allowed");
  const rated = await Rating.exists({
    transactionId: tx._id,
    raterId: req.user.sub,
  });
  return ok(res, { ...tx, id: tx._id, rated: !!rated });
}

export async function completeTransaction(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return notFound(res, "Transaction not found");
  if (String(tx.sellerId) !== req.user.sub)
    return forbidden(res, "Only seller can complete");
  if (tx.status !== "initiated") return badRequest(res, "Invalid status");
  tx.status = "completed";
  await tx.save();
  return ok(res, { id: tx.id, status: tx.status });
}

export async function cancelTransaction(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return notFound(res, "Transaction not found");
  if (
    String(tx.sellerId) !== req.user.sub &&
    String(tx.buyerId) !== req.user.sub
  )
    return forbidden(res, "Not allowed");
  if (tx.status !== "initiated") return badRequest(res, "Cannot cancel now");
  tx.status = "cancelled";
  await tx.save();
  return ok(res, { id: tx.id, status: tx.status });
}
