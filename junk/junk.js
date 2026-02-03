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