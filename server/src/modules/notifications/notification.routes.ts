import { Router } from "express";
import * as controller from "./notification.controller.js";
import { auth } from "../../middlewares/auth.js";
import { notificationEvents } from "./notification.model.js";
const router = Router();
router.get("/", auth(true), controller.listNotifications);
router.patch("/:id/read", auth(true), controller.markNotificationRead);
router.post("/mark-all-read", auth(true), controller.markAllRead);

// SSE stream (best-effort, không queue lịch sử)
router.get("/stream", auth(true), (req: any, res: any) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
  const userId = req.user.sub;
  function handler(doc: any) {
    if (String(doc.userId) === String(userId)) {
      res.write(`event: notification\n`);
      res.write(
        `data: ${JSON.stringify({
          id: doc.id,
          type: doc.type,
          message: doc.message,
          data: doc.data,
          createdAt: doc.createdAt,
        })}\n\n`
      );
    }
  }
  notificationEvents.on("created", handler);
  req.on("close", () => {
    notificationEvents.off("created", handler);
  });
});
export default router;
