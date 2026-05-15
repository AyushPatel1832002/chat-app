import mongoose, { Schema, model, models } from "mongoose";

const RoomSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isPrivate: { type: Boolean, default: false },
  avatar: { type: String, default: "" },
}, { timestamps: true });

export const Room = models.Room || model("Room", RoomSchema);
