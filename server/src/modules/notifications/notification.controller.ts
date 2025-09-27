import { Request, Response } from "express";
import { Notification } from "./notification.model.js";
import { ok, unauthorized, notFound } from "../../utils/response.js";

export async function listNotifications(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const items = await Notification.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(100)
    .select("type message data readAt createdAt")
    .lean();
  return ok(
    res,
    items.map((n) => ({ id: n._id, ...n }))
  );
}

export async function markNotificationRead(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const n = await Notification.findOne({
    _id: req.params.id,
    userId: req.user.sub,
  });
  if (!n) return notFound(res, "Notification not found");
  if (!n.readAt) {
    n.readAt = new Date();
    await n.save();
  }
  return ok(res, { id: n.id, readAt: n.readAt });
}

export async function markAllRead(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const result = await Notification.updateMany(
    { userId: req.user.sub, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  return ok(res, { modified: result.modifiedCount });
}
