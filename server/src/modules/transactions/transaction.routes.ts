import { Router } from "express";
import * as controller from "./transaction.controller.js";
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { TransactionCreateSchema } from "../../schemas/index.js";
const router = Router();
router.post(
  "/",
  auth(true),
  validate({ body: TransactionCreateSchema }),
  controller.createTransaction
);
router.get("/mine", auth(true), controller.listMyTransactions as any);
router.get("/:id", auth(true), controller.getTransaction as any);
router.post("/:id/complete", auth(true), controller.completeTransaction as any);
router.post("/:id/cancel", auth(true), controller.cancelTransaction as any);
export default router;
