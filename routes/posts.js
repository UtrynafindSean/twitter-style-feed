const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

// Create a post
router.post("/", async (req, res) => {
  try {
    const { authorId, authorName, username, avatar, text, image } = req.body;

    if (!authorId || !authorName || !username || !text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Required post information is missing",
      });
    }

    const post = await Post.create({
      authorId,
      authorName,
      username,
      avatar: avatar || "U",
      text: text.trim(),
      image: image || "",
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get posts error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
