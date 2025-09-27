import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  postId?: mongoose.Types.ObjectId; // reported post
  reportedUserId?: mongoose.Types.ObjectId; // reported user
  reason: string;
  status: "open" | "reviewing" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    reportedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "reviewing", "closed"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

export const Report =
  mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
