import { Router } from "express";
import * as controller from "./admin.controller.js";
import { auth, requireRole } from "../../middlewares/auth.js";
const router = Router();
router.use(auth(true), requireRole("admin"));
router.get("/dashboard", controller.dashboard);
router.patch("/posts/:id/approve", controller.approvePost);
router.patch("/posts/:id/reject", controller.rejectPost);
export default router;
