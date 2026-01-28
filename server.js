import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import "dotenv/config"
import mongoose from "mongoose"
// import thoughtJson from "./data.json"

// let thoughtData = thoughtJson

const mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.log("Could not connect to MongoDB", error)
  })

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Mongoose schema and model
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

  const query = {}

  if (hearts) {
    query.hearts = { $gte: Number(hearts) }
  }

  if (after) {
    query.createdAt = { $gt: new Date(after) }
  }
  try {
    const filteredThoughts = await Thought.find(query).sort({ createdAt: "desc" }).limit(20)

    if (filteredThoughts.length === 0) {
      return res.status(404).json({
        success: false,
        response: [],
        message: "No thoughts was found for that query",
      })
    }

    return res.status(200).json({
      success: true,
      response: filteredThoughts,
      message: "Success",
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      response: [],
      message: error,
    })
  }
})

// Endpoint to get a single thought by its id
app.get("/thoughts/:id", async (req, res) => {
  const id = req.params.id

  try {
    const thought = await Thought.findById(id)

    if (!thought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found",
      })
    }
    return res.status(200).json({
      success: true,
      response: thought,
      message: "Success",
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error,
    })
  }
})

// Endpoint to create a new thought
app.post("/thoughts", async (req, res) => {
  const { message } = req.body

  try {
    const createdThought = await new Thought({ message }).save()

    return res.status(201).json({
      success: true,
      response: createdThought,
      message: "Thought created successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error,
    })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
