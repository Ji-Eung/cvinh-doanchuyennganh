import { Request, Response } from "express";
import { ChatMessage, chatEvents } from "./chat.model.js";
import {
  unauthorized,
  ok,
  badRequest,
  notFound,
} from "../../utils/response.js";
import { User } from "../users/user.model.js";

export async function listConversation(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const otherId = req.params.userId;
  if (!otherId) return badRequest(res, "userId required");
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const messages = await ChatMessage.find({
    $or: [
      { fromUserId: req.user.sub, toUserId: otherId },
      { fromUserId: otherId, toUserId: req.user.sub },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("fromUserId toUserId body createdAt readAt")
    .lean();
  return ok(res, messages.reverse());
}

export async function sendMessage(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { toUserId, body } = (req as any).validatedBody || req.body;
  if (!toUserId || !body) return badRequest(res, "toUserId & body required");
  if (String(toUserId) === req.user.sub)
    return badRequest(res, "Cannot send to self");
  const exists = await User.exists({ _id: toUserId });
  if (!exists) return notFound(res, "User not found");
  const doc = await ChatMessage.create({
    fromUserId: req.user.sub,
    toUserId,
    body: String(body).slice(0, 2000),
  });
  // Emit realtime event for both participants
  chatEvents.emit("message", {
    id: doc.id,
    fromUserId: doc.fromUserId,
    toUserId: doc.toUserId,
    body: doc.body,
    createdAt: doc.createdAt,
  });
  return ok(res, { id: doc.id });
}
