```js
const express = require("express");
const User = require("../user");

const router = express.Router();

/* =========================
   SIGN UP
========================= */

router.post("/signup", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() },
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        following: user.following,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || user.password !== password) {
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
        bio: user.bio,
        avatar: user.avatar,
        following: user.following,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
});

module.exports = router;
```;
