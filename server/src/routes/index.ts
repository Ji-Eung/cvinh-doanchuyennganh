import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import postRoutes from "../modules/posts/post.routes.js";
import categoryRoutes from "../modules/categories/category.routes.js";
import favoriteRoutes from "../modules/favorites/favorite.routes.js";
import reportRoutes from "../modules/reports/report.routes.js";
import transactionRoutes from "../modules/transactions/transaction.routes.js";
import ratingRoutes from "../modules/ratings/rating.routes.js";
import notificationRoutes from "../modules/notifications/notification.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import chatRoutes from "../modules/chat/chat.routes.js";
import uploadRoutes from "../modules/uploads.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/categories", categoryRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/reports", reportRoutes);
router.use("/transactions", transactionRoutes);
router.use("/ratings", ratingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);
router.use("/chat", chatRoutes);
router.use("/uploads", uploadRoutes);

export default router;
