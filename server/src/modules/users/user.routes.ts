import { Router } from "express";
import * as controller from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { z } from "zod";
import { UserProfileUpdateSchema } from "../../schemas/index.js";

const router = Router();
router.get("/:id", controller.getProfile);
router.get("/me/profile", auth(true), controller.getMe);
router.patch(
  "/me/avatar",
  auth(true),
  validate({ body: z.object({ avatarUrl: z.string().url() }) }),
  controller.updateAvatar
);
router.patch(
  "/me/profile",
  auth(true),
  validate({ body: UserProfileUpdateSchema }),
  controller.updateProfile
);

export default router;
