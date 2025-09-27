import { Router } from "express";
import * as controller from "./post.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  PostListQuerySchema,
  PostCreateSchema,
  PostUpdateSchema,
} from "../../schemas/index.js";
import { z } from "zod";
const router = Router();
router.get("/", validate({ query: PostListQuerySchema }), controller.listPosts);
router.get("/mine/list", auth(true), controller.listMyPosts as any);
router.post(
  "/",
  auth(true),
  validate({ body: PostCreateSchema }),
  controller.createPost
);
router.get("/:id", controller.getPost);
router.patch(
  "/:id",
  auth(true),
  validate({ body: PostUpdateSchema }),
  controller.updatePost
);
router.delete("/:id", auth(true), controller.deletePost);
router.post(
  "/:id/images",
  auth(true),
  validate({ body: z.object({ imageUrl: z.string().url() }) }),
  controller.appendImage
);
router.post("/:id/mark-sold", auth(true), controller.markPostSold);
router.post(
  "/:id/images/delete",
  auth(true),
  validate({ body: z.object({ imageUrl: z.string().url() }) }),
  controller.deleteImage
);
export default router;
