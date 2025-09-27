import { Router } from "express";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./chat.controller.js";
import { z } from "zod";
import rateLimit from "express-rate-limit";
const router = Router();
const SendMessageSchema = z.object({
  toUserId: z.string(),
  body: z.string().min(1).max(2000),
});
router.get("/with/:userId", auth(true), controller.listConversation);
const sendLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
router.post(
  "/send",
  auth(true),
  sendLimiter,
  validate({ body: SendMessageSchema }),
  controller.sendMessage
);
// SSE stream for realtime messages between authenticated user and arbitrary other participants
router.get("/stream", auth(true), (req: any, res: any) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  const userId = req.user.sub;
  const { withUser } = req.query; // optional: restrict to one counterpart
  const { chatEvents } = require("./chat.model.js");
  function handler(msg: any) {
    const involves =
      String(msg.fromUserId) === String(userId) ||
      String(msg.toUserId) === String(userId);
    if (!involves) return;
    if (withUser) {
      const w = String(withUser);
      const matchPair =
        (String(msg.fromUserId) === w &&
          String(msg.toUserId) === String(userId)) ||
        (String(msg.toUserId) === w &&
          String(msg.fromUserId) === String(userId));
      if (!matchPair) return;
    }
    res.write("event: message\n");
    res.write(`data: ${JSON.stringify(msg)}\n\n`);
  }
  chatEvents.on("message", handler);
  req.on("close", () => chatEvents.off("message", handler));
});
export default router;
