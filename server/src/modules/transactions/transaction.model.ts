import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  postId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  priceAtSale: number;
  status: "initiated" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    priceAtSale: { type: Number, required: true },
    status: {
      type: String,
      enum: ["initiated", "completed", "cancelled"],
      default: "initiated",
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ postId: 1, buyerId: 1 }, { unique: true });
// Efficient sorting/filtering for user dashboards
TransactionSchema.index({ buyerId: 1, createdAt: -1 });
TransactionSchema.index({ sellerId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1, createdAt: -1 });

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
