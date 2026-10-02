const express = require("express");
const mongoose = require("mongoose");

const User = require("../user");

const router = express.Router();

/* =========================
   HELPER
========================= */

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/* =========================
   SIGN UP
========================= */

router.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, username, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const cleanName = name.trim();

    const cleanUsername = username
      .trim()
      .replace(/^@/, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can only contain letters, numbers, dots, underscores and hyphens",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      if (String(existingUser.email).toLowerCase() === cleanEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Username is already taken",
      });
    }

    const user = await User.create({
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      password,
      following: [],
      bio: "",
      avatar: cleanName.charAt(0).toUpperCase() || "U",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   GET CURRENT USER
========================= */

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select(
      "name username email avatar bio following createdAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        following: user.following || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
