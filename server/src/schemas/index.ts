import { z } from "zod";

export const AuthRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthRefreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const PostListQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  status: z.enum(["pending", "approved", "sold", "rejected"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(), // ISO date or ObjectId fallback
});

export const PostCreateSchema = z.object({
  title: z.string().min(3),
  price: z.number().min(0),
  description: z.string().optional(),
  categoryId: z.string(),
  images: z.array(z.string().url()).max(8).optional(),
});

export const PostUpdateSchema = z
  .object({
    title: z.string().min(3).optional(),
    price: z.number().min(0).optional(),
    description: z.string().optional(),
    categoryId: z.string().optional(),
    images: z.array(z.string().url()).max(8).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field required",
    path: ["title"],
  });

export const FavoriteToggleSchema = z.object({ postId: z.string() });

export const ReportCreateSchema = z
  .object({
    postId: z.string().optional(),
    reportedUserId: z.string().optional(),
    reason: z.string().min(5),
  })
  .refine((d) => d.postId || d.reportedUserId, {
    message: "postId or reportedUserId required",
    path: ["postId"],
  });

export const ReportStatusUpdateSchema = z.object({
  status: z.enum(["open", "reviewing", "closed"]),
});

export const TransactionCreateSchema = z.object({ postId: z.string() });

export const RatingCreateSchema = z.object({
  transactionId: z.string(),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const UserProfileUpdateSchema = z
  .object({
    name: z.string().min(2).max(60).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field required",
    path: ["name"],
  });
