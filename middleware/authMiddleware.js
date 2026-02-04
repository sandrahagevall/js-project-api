import { User } from "../models/User"

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader) {
      return res.status(401).json({
        message: "Missing Authorization header",
      })
    }

    const accessToken = authHeader.replace("Bearer ", "")

    const user = await User.findOne({ accessToken })

    if (!user) {
      return res.status(401).json({
        message: "Authentication missing or invalid",
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}