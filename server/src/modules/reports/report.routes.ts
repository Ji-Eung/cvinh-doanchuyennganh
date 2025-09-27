import { Router } from "express";
import * as controller from "./report.controller.js";
import { validate } from "../../middlewares/validate.js";
import {
  ReportCreateSchema,
  ReportStatusUpdateSchema,
} from "../../schemas/index.js";
import { auth, requireRole } from "../../middlewares/auth.js";
import rateLimit from "express-rate-limit";
const router = Router();
const createReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
router.post(
  "/",
  auth(true),
  createReportLimiter,
  validate({ body: ReportCreateSchema }),
  controller.createReport
);
router.get("/", auth(true), requireRole("admin"), controller.listReports);
router.patch(
  "/:id/status",
  auth(true),
  requireRole("admin"),
  validate({ body: ReportStatusUpdateSchema }),
  controller.updateReportStatus
);
export default router;
