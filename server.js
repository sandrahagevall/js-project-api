import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import "dotenv/config"
import mongoose from "mongoose"


const mongoUrl = process.env.MONGO_URL
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.log("Could not connect to MongoDB", error)
  })

mongoose.connection.on("connected", () => {
  console.log("CONNECTED TO DATABASE:", mongoose.connection.name)
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
// Query params 'hearts','sort' and 'order' can be used to filter thoughts on minimum likes and sort them by date or likes
app.get("/thoughts", async (req, res) => {
  const { hearts, sort, order } = req.query

  const query = {}

  let sortOption = { createdAt: "desc" }

  if (sort === "date") {
    sortOption = { createdAt: order === "asc" ? "asc" : "desc" }
  } else if (sort === "likes") {
    sortOption = { hearts: order === "asc" ? "asc" : "desc" }
  }

  if (hearts) {
    query.hearts = { $gte: Number(hearts) }
  }

  try {
    const filteredThoughts = await Thought.find(query).sort(sortOption).limit(20)

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
  const { id } = req.params

  // Validate id 
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Invalid thought id",
    })
  }

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

// Endpoint to like a thought by its id
app.post("/thoughts/:id/like", async (req, res) => {
  const { id } = req.params

  // Validate id before updating
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Invalid thought id",
    })
  }

  try {
    const likedThought = await Thought.findByIdAndUpdate(
      id,
      { $inc: { hearts: 1 } },
      { new: true }
    )

    if (!likedThought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found",
      })
    }

    return res.status(200).json({
      success: true,
      response: likedThought,
      message: "Thought liked successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error,
    })
  }
})

// Endpoint to delete a thought by its id
app.delete("/thoughts/:id", async (req, res) => {
  const { id } = req.params

  // Validate id before deleting
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Invalid thought id",
    })
  }

  try {
    const deletedThought = await Thought.findByIdAndDelete(id)

    if (!deletedThought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found",
      })
    }
    return res.status(200).json({
      success: true,
      response: deletedThought,
      message: "Thought deleted successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: error,
    })
  }
})

// Endpoint to update a thought's message by its id
app.put("/thoughts/:id", async (req, res) => {
  const { id } = req.params
  const { message } = req.body

  // Validate id before updating
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Invalid thought id",
    })
  }

  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      id,
      { message },
      { new: true, runValidators: true }
    )

    if (!updatedThought) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Thought not found",
      })
    }

    return res.status(200).json({
      success: true,
      response: updatedThought,
      message: "Thought updated successfully",
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
