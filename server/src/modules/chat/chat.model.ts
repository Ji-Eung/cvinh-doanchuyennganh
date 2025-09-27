import mongoose, { Schema, Document } from "mongoose";
import EventEmitter from "events";

export interface IChatMessage extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  readAt?: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Conversation listing index
ChatMessageSchema.index({ fromUserId: 1, toUserId: 1, createdAt: -1 });
ChatMessageSchema.index({ toUserId: 1, readAt: 1, createdAt: -1 });

export const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export const chatEvents = new EventEmitter();
