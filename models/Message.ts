import mongoose, { Schema, model, models } from "mongoose";

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  roomId: { type: String, required: true, index: true },
  delivered: { type: Boolean, default: false },
  read: { type: Boolean, default: false },
  tempId: { type: String }, 
}, { timestamps: true });

MessageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = models.Message || model("Message", MessageSchema);
