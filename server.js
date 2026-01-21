import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import thoughtData from "./data.json"

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
// Query params 'hearts' can be used to filter thoughts with minimum number of hearts
app.get("/thoughts", (req, res) => {
  const { hearts } = req.query

  let filteredThoughts = thoughtData

  if (hearts) {
    const minHearts = Number(hearts)
    filteredThoughts = filteredThoughts.filter((thought) => thought.hearts >= minHearts)
  }

  const sortThoughtByDate = [...filteredThoughts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  res.json(sortThoughtByDate)
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
