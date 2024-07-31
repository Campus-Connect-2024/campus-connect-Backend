import mongoose, { Schema } from "mongoose";

const followrsSchema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User",
    },
    owner: {
      type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Followers = mongoose.model("Followers", followrsSchema);
