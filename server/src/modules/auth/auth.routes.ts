import { Router } from "express";
import * as controller from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { authLimiter, refreshLimiter } from "../../middlewares/rateLimit.js";
import {
  AuthRegisterSchema,
  AuthLoginSchema,
  AuthRefreshSchema,
} from "../../schemas/index.js";

const router = Router();
router.post(
  "/register",
  authLimiter,
  validate({ body: AuthRegisterSchema }),
  controller.register
);
router.post(
  "/login",
  authLimiter,
  validate({ body: AuthLoginSchema }),
  controller.login
);
router.post(
  "/refresh",
  refreshLimiter,
  validate({ body: AuthRefreshSchema }),
  controller.refresh
);
router.post("/logout", controller.logout);
export default router;
