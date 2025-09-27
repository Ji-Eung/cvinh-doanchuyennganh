import mongoose, { Schema, Document } from "mongoose";

export interface IRating extends Document {
  transactionId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId; // who gives rating
  targetUserId: mongoose.Types.ObjectId; // who is rated
  score: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },
    raterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

RatingSchema.index({ transactionId: 1, raterId: 1 }, { unique: true });

export const Rating =
  mongoose.models.Rating || mongoose.model<IRating>("Rating", RatingSchema);
