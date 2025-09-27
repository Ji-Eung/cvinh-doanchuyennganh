import { Request, Response } from "express";
import { Post } from "./post.model.js";
import { z } from "zod";
import { User } from "../users/user.model.js";
import {
  ok,
  created,
  unauthorized,
  notFound,
  badRequest,
} from "../../utils/response.js";
import { buildPaginationMeta } from "../../utils/pagination.js";
import { notFound as nf } from "../../utils/response.js";
import {
  absoluteUploadUrl,
  extractStoredFilename,
} from "../../utils/uploader.js";

export async function listPosts(req: Request, res: Response) {
  const {
    q,
    categoryId,
    minPrice,
    maxPrice,
    status,
    page,
    limit,
    cursor,
  }: any = (req as any).validatedQuery || {};
  const filter: any = {};
  if (q) filter.title = { $regex: q, $options: "i" };
  if (categoryId) filter.categoryId = categoryId;
  if (minPrice != null || maxPrice != null) {
    filter.price = {};
    if (minPrice != null) filter.price.$gte = minPrice;
    if (maxPrice != null) filter.price.$lte = maxPrice;
  }
  if (status) filter.status = status;

  // Cursor-based pagination (createdAt descending) has priority over page mode if cursor provided
  if (cursor) {
    // Accept either ISO string date or ObjectId string
    const date = !isNaN(Date.parse(cursor)) ? new Date(cursor) : undefined;
    if (date) {
      filter.createdAt = { $lt: date };
    } else if (/^[0-9a-fA-F]{24}$/.test(cursor)) {
      // Fallback: compare by _id ordering if date invalid
      filter._id = { $lt: cursor };
    }
    const items = await Post.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title price status categoryId sellerId createdAt")
      .lean();
    const nextCursor =
      items.length === limit
        ? items[items.length - 1].createdAt.toISOString()
        : null;
    return ok(res, items, { cursor: nextCursor, mode: "cursor" });
  }

  // Fallback: page-based pagination
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title price status categoryId sellerId createdAt")
      .lean(),
    Post.countDocuments(filter),
  ]);
  return ok(res, items, {
    ...buildPaginationMeta(page, limit, total),
    mode: "page",
  });
}

export async function listMyPosts(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const posts = await Post.find({ sellerId: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(100)
    .select("title price status createdAt")
    .lean();
  return ok(res, posts);
}

export async function createPost(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const body: any = (req as any).validatedBody || req.body;
  const images = Array.isArray(body.images)
    ? body.images.map((i: string) => extractStoredFilename(i))
    : [];
  const doc = await Post.create({
    title: body.title,
    description: body.description,
    price: body.price,
    categoryId: body.categoryId,
    sellerId: req.user.sub,
    images,
  });
  return created(res, { id: doc.id });
}

export async function getPost(req: Request, res: Response) {
  const post: any = await Post.findById(req.params.id).lean();
  if (!post) return notFound(res, "Post not found");
  const seller = await User.findById(post.sellerId).select(
    "ratingsCount ratingsTotal"
  );
  let sellerRatingAverage: number | null = null;
  if (seller && seller.ratingsCount > 0) {
    sellerRatingAverage = Number(
      (seller.ratingsTotal / seller.ratingsCount).toFixed(2)
    );
  }
  return ok(res, { ...post, sellerRatingAverage });
}

export async function updatePost(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const body: any = (req as any).validatedBody || req.body;
  const post = await Post.findOne({
    _id: req.params.id,
    sellerId: req.user.sub,
  });
  if (!post) return notFound(res, "Post not found or not owned");
  // If images provided replace full set
  if (body.images) {
    post.images = body.images.map((i: string) => extractStoredFilename(i));
  }
  if (body.title) post.title = body.title;
  if (body.description !== undefined) post.description = body.description;
  if (body.price !== undefined) post.price = body.price;
  if (body.categoryId) post.categoryId = body.categoryId;
  await post.save();
  return ok(res, { id: post.id });
}

export async function appendImage(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const body: any = (req as any).validatedBody || req.body;
  const { imageUrl } = body;
  if (!imageUrl) return badRequest(res, "imageUrl required");
  const post = await Post.findOne({
    _id: req.params.id,
    sellerId: req.user.sub,
  });
  if (!post) return notFound(res, "Post not found or not owned");
  if (post.images.length >= 8) return badRequest(res, "Max 8 images");
  post.images.push(extractStoredFilename(imageUrl));
  await post.save();
  return ok(res, {
    images: post.images,
    imagesAbsolute: post.images.map((p: string) =>
      absoluteUploadUrl(req, p.replace(/.*\//, ""))
    ),
  });
}

export async function markPostSold(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const post = await Post.findOne({
    _id: req.params.id,
    sellerId: req.user.sub,
  });
  if (!post) return notFound(res, "Post not found or not owned");
  if (post.status === "sold")
    return ok(res, { id: post.id, status: post.status });
  post.status = "sold";
  await post.save();
  return ok(res, { id: post.id, status: post.status });
}

export async function deleteImage(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { imageUrl } = (req as any).validatedBody || req.body || {};
  if (!imageUrl) return badRequest(res, "imageUrl required");
  const post = await Post.findOne({
    _id: req.params.id,
    sellerId: req.user.sub,
  });
  if (!post) return notFound(res, "Post not found or not owned");
  const initialLen = post.images.length;
  const storedName = extractStoredFilename(imageUrl);
  post.images = post.images.filter((img: string) => img !== storedName);
  if (post.images.length === initialLen)
    return notFound(res, "Image not found on post");
  await post.save();
  return ok(res, { images: post.images });
}

export async function deletePost(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const post = await Post.findOne({
    _id: req.params.id,
    sellerId: req.user.sub,
  });
  if (!post) return notFound(res, "Post not found or not owned");
  await Post.deleteOne({ _id: post._id });
  return ok(res, { deleted: true });
}
