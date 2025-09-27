import { Request, Response } from "express";
import { Post } from "../posts/post.model.js";
import { Report } from "../reports/report.model.js";
import { User } from "../users/user.model.js";
import { Transaction } from "../transactions/transaction.model.js";
import { ok, notFound, badRequest } from "../../utils/response.js";
import { notify } from "../notifications/notification.model.js";

export async function dashboard(_req: Request, res: Response) {
  const [
    totalUsers,
    totalPosts,
    transactions,
    pendingPosts,
    openReports,
    reviewingReports,
  ] = await Promise.all([
    User.countDocuments({}),
    Post.countDocuments({}),
    Transaction.countDocuments({}),
    Post.countDocuments({ status: "pending" }),
    Report.countDocuments({ status: "open" }),
    Report.countDocuments({ status: "reviewing" }),
  ]);
  return ok(res, {
    totalUsers,
    totalPosts,
    transactions,
    pendingPosts,
    reports: { open: openReports, reviewing: reviewingReports },
  });
}

export async function approvePost(req: Request, res: Response) {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return notFound(res, "Post not found");
  if (post.status !== "pending")
    return badRequest(res, "Post not in pending state");
  post.status = "approved";
  await post.save();
  notify(post.sellerId, "post.approved", "Bài đăng của bạn đã được duyệt", {
    postId: post.id,
  });
  return ok(res, { id: post.id, status: post.status });
}

export async function rejectPost(req: Request, res: Response) {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return notFound(res, "Post not found");
  if (post.status !== "pending")
    return badRequest(res, "Post not in pending state");
  const reason = (req as any).validatedBody?.reason || req.body?.reason;
  post.status = "rejected";
  if (reason) post.rejectionReason = String(reason).slice(0, 300);
  await post.save();
  notify(post.sellerId, "post.rejected", "Bài đăng của bạn bị từ chối", {
    postId: post.id,
    reason: post.rejectionReason,
  });
  return ok(res, {
    id: post.id,
    status: post.status,
    rejectionReason: post.rejectionReason,
  });
}
