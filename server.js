import cors from "cors"
import express from "express"
import listEndpoints from "express-list-endpoints"
import "dotenv/config"
import mongoose from "mongoose"

import userRoutes from "./routes/userRoutes"
import thoughtRoutes from "./routes/thoughtRoutes"

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


// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)

  res.json({
    message: "Welcome to the Happy Thoughts API",
    endpoints: endpoints
  })
})

app.use("/users", userRoutes)
app.use("/thoughts", thoughtRoutes)

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
