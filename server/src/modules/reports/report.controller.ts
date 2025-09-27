import { Request, Response } from "express";
import { Report } from "./report.model.js";
import { Post } from "../posts/post.model.js";
import { User } from "../users/user.model.js";
import {
  created,
  unauthorized,
  badRequest,
  notFound,
  ok,
} from "../../utils/response.js";

export async function createReport(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { postId, reportedUserId, reason } =
    (req as any).validatedBody || req.body;
  if (postId) {
    const post = await Post.findById(postId).select("_id");
    if (!post) return notFound(res, "Post not found");
  }
  if (reportedUserId) {
    const user = await User.findById(reportedUserId).select("_id");
    if (!user) return notFound(res, "User not found");
  }
  const doc = await Report.create({
    reporterId: req.user.sub,
    postId,
    reportedUserId,
    reason,
  });
  return created(res, { id: doc.id });
}

export async function listReports(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const status = req.query.status as string | undefined;
  const filter: any = {};
  if (status) filter.status = status;
  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("reporterId postId reportedUserId reason status createdAt")
    .lean();
  return ok(res, reports);
}

export async function updateReportStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = (req as any).validatedBody || req.body;
  if (!status || !["open", "reviewing", "closed"].includes(status)) {
    return badRequest(res, "Invalid status");
  }
  const report = await Report.findById(id);
  if (!report) return notFound(res, "Report not found");
  report.status = status as any;
  await report.save();
  return ok(res, { id: report.id, status: report.status });
}
