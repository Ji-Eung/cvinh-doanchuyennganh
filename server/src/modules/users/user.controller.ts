import { Request, Response } from "express";
import { User } from "./user.model.js";
import { notFound, ok } from "../../utils/response.js";
import { unauthorized, badRequest } from "../../utils/response.js";
import { absoluteUploadUrl } from "../../utils/uploader.js";

export async function getProfile(req: Request, res: Response) {
  const user = await User.findById(req.params.id).select(
    "name email avatarUrl role ratingsCount ratingsTotal createdAt updatedAt"
  );
  if (!user) return notFound(res, "User not found");
  let ratingAverage: number | null = null;
  if (user.ratingsCount > 0) {
    ratingAverage = Number((user.ratingsTotal / user.ratingsCount).toFixed(2));
  }
  return ok(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    role: user.role,
    ratingAverage,
    ratingsCount: user.ratingsCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const user = await User.findById(req.user.sub).select(
    "name email avatarUrl role ratingsCount ratingsTotal createdAt updatedAt"
  );
  if (!user) return notFound(res, "User not found");
  let ratingAverage: number | null = null;
  if (user.ratingsCount > 0) {
    ratingAverage = Number((user.ratingsTotal / user.ratingsCount).toFixed(2));
  }
  return ok(res, {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    role: user.role,
    ratingAverage,
    ratingsCount: user.ratingsCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}

export async function updateAvatar(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { avatarUrl } = (req as any).validatedBody || req.body;
  if (!avatarUrl) return badRequest(res, "avatarUrl required");
  const user = await User.findById(req.user.sub);
  if (!user) return notFound(res, "User not found");
  user.avatarUrl = avatarUrl;
  await user.save();
  return ok(res, {
    avatarUrl: user.avatarUrl,
    avatarAbsoluteUrl: user.avatarUrl
      ? absoluteUploadUrl(req, user.avatarUrl.replace(/.*\//, ""))
      : null,
  });
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user) return unauthorized(res);
  const { name } = (req as any).validatedBody || req.body;
  const user = await User.findById(req.user.sub);
  if (!user) return notFound(res, "User not found");
  if (name) user.name = name;
  await user.save();
  return ok(res, { id: user.id, name: user.name });
}
