import { Router } from "express";
import * as controller from "./rating.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { RatingCreateSchema } from "../../schemas/index.js";
import { listUserRatings } from "./ratingList.controller.js";
import rateLimit from "express-rate-limit";
const router = Router();
const rateLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 40 });
router.post(
  "/",
  auth(true),
  rateLimiter,
  validate({ body: RatingCreateSchema }),
  controller.createRating
);
router.get("/user/:userId", listUserRatings);
export default router;
