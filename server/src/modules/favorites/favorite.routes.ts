import { Router } from "express";
import * as controller from "./favorite.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { FavoriteToggleSchema } from "../../schemas/index.js";
const router = Router();
router.get("/", auth(true), controller.listFavorites);
router.post(
  "/toggle",
  auth(true),
  validate({ body: FavoriteToggleSchema }),
  controller.toggleFavorite
);
export default router;
