import { Request, Response } from "express";
import { Favorite } from "./favorite.model.js";
import { Post } from "../posts/post.model.js";
import { z } from "zod";
import {
  ok,
  created,
  unauthorized,
  notFound,
  badRequest,
} from "../../utils/response.js";

export async function listFavorites(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const favs = await Favorite.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate({
      path: "postId",
      select: "title price status",
      options: { lean: true },
    })
    .lean();
  return ok(
    res,
    favs.map((f) => ({ id: f._id, post: f.postId, createdAt: f.createdAt }))
  );
}

export async function toggleFavorite(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { postId } = (req as any).validatedBody || req.body;
  const exists = await Favorite.findOne({ userId: req.user.sub, postId });
  if (exists) {
    await Favorite.deleteOne({ _id: exists._id });
    return ok(res, { removed: true });
  }
  const post = await Post.findById(postId).select("_id");
  if (!post) return notFound(res, "Post not found");
  await Favorite.create({ userId: req.user.sub, postId });
  return created(res, { added: true });
}
