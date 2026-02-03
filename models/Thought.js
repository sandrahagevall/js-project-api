import mongoose, { Schema } from "mongoose"

// Mongoose schema and model
const thoughtSchema = new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140,
    trim: true
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

export const Thought = mongoose.model("Thought", thoughtSchema)


// const thoughtSchema = new mongoose.Schema({
//   message: {
//     type: String,
//     required: true,
//     minlength: 5,
//     maxlength: 140,
//     trim: true
//   },
//   hearts: {
//     type: Number,
//     default: 0
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// })

// export const Thought = mongoose.model("Thought", thoughtSchema)