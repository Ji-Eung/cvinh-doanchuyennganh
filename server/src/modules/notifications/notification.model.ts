import mongoose, { Schema, Document } from "mongoose";
import { EventEmitter } from "events";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string; // e.g. post.approved, post.rejected, tx.created, tx.completed
  message: string;
  data?: any;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, required: true, index: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Optimize common queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export async function notify(
  userId: string | mongoose.Types.ObjectId,
  type: string,
  message: string,
  data?: any
) {
  try {
    const doc = await Notification.create({ userId, type, message, data });
    notificationEvents.emit("created", doc);
  } catch (e) {
    // best-effort, log later if logger available
  }
}

export const notificationEvents = new EventEmitter();
