import { User } from "../models/User"

export const authenticateUser = async (req, res, next) => {
  try {
    const user = await User.findOne({
      accessToken: req.header("Authorization").replace("Bearer ", "")
    })

    if (user) {
      req.user = user
      next()
    } else {
      res.status(401).json({
        message: "Authentication missing or invalid"
      })
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}