import express from "express"
import bcrypt from "bcrypt"
import { User } from "../models/User.js"
import { authenticateUser } from "../middleware/authMiddleware.js"

const router = express.Router()

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An error occurred when creating the user",
      })
    }

    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(password, salt)
    const user = new User({ email, password: hashedPassword })

    await user.save()

    res.status(200).json({
      success: true,
      message: "User created successfully",
      response: {
        email: user.email,
        id: user._id,
        accessToken: user.accessToken,
      }
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create user",
      response: error,
    })
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
        success: true,
        message: "Login successful",
        response: {
          email: user.email,
          id: user._id,
          accessToken: user.accessToken,
        }
      })
    } else {
      res.status(401).json({
        success: false,
        message: "Login failed: wrong email or password",
        response: null,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      response: error,
    })
  }
});

router.get("/:id/thoughts", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.likedThoughts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
