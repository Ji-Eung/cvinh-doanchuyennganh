import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  description?: string;
  price: number;
  images: string[];
  categoryId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "sold" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "sold", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Index hỗn hợp phục vụ list nhanh theo trạng thái + thời gian
PostSchema.index({ status: 1, createdAt: -1 });
// Index hỗn hợp theo category + thời gian
PostSchema.index({ categoryId: 1, createdAt: -1 });
// Index bài của 1 seller theo thời gian
PostSchema.index({ sellerId: 1, createdAt: -1 });

export const Post =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
