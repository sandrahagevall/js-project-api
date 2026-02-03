import express from "express"
import { Thought } from "../models/Thought"
import { authenticateUser } from "../middleware/authMiddleware"

const router = express.Router()

// Endpoint to get all thoughts, sorted by date (most recent first)
// Query params 'hearts','sort' and 'order' can be used to filter thoughts on minimum likes and sort them by date or likes
router.get("/", async (req, res) => {
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

    // if (filteredThoughts.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     response: [],
    //     message: "No thoughts was found for that query",
    //   })
    // }

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
router.get("/:id", async (req, res) => {
  const { id } = req.params

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
router.post("/", authenticateUser, async (req, res) => {
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
      response: error,
      message: "Couldn't create thought",
    })
  }
})

// Endpoint to like a thought by its id
router.post("/:id/like", async (req, res) => {
  const { id } = req.params

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
router.delete("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params

  try {
    const deletedThought = await Thought.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    })

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
router.patch("/:id", async (req, res) => {
  const { id } = req.params
  const { message } = req.body

  try {
    const updatedThought = await Thought.findOneAndUpdate(
      {
        _id: id,
        userId: req.user._id,
      },
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
      response: error,
      message: "Error editing thought",
    })
  }
})

export default router