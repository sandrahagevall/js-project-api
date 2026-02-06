import mongoose, { Schema } from "mongoose"
import crypto from "crypto"

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  },
  likedThoughts: {
    type: [String],
    required: true,
    default: [],
  }
});

export const User = mongoose.model("User", userSchema)
