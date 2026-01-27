import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import dotenv from "dotenv"
import mongoose from "mongoose"
// import thoughtData from "./data.json"

dotenv.config()

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.log("Could not connect to MongoDB", error)
  })

const thoughtSchema = new mongoose.Schema({
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
  }
})

const Thought = mongoose.model("Thought", thoughtSchema)

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    message: "Welcome to Happy Thoughts API",
    endpoints: endpoints
  })
})

// Endpoint to get all thoughts, sorted by date (most recent first)
// Query params 'hearts' and 'after' can be used to filter thoughts with minimum number of hearts and thoughts created after a specific date
app.get("/thoughts", async (req, res) => {
  const { hearts, after } = req.query

  const filter = {}

  if (hearts) {
    filter.hearts = { $gte: Number(hearts) }
  }

  if (after) {
    filter.createdAt = { $gt: new Date(after) }
  }
  try {
    const thoughts = await Thought.find(filter).sort({ createdAt: "desc" }).limit(20)
    res.json(thoughts)
  } catch (error) {
    res.status(500).json({ error: "Could not fetch thoughts" })
  }
})

// Endpoint to get a single thought by its id
app.get("/thoughts/:id", (req, res) => {
  const id = req.params.id
  const thought = thoughtData.find((thought) => thought._id === id)

  if (!thought) {
    return res.status(404).json({ error: `thought with id ${id} does not exist` })
  }

  res.json(thought)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
