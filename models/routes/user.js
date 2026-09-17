const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

/* GET FOLLOWING */

router.get("/:userId/following", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      following: Array.isArray(user.following) ? user.following : [],
    });
  } catch (error) {
    console.error("Get following error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* FOLLOW / UNFOLLOW */

router.post("/:userId/follow", async (req, res) => {
  try {
    const { userId } = req.params;

    const cleanUsername = String(req.body.username || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(userId) || !cleanUsername) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID or username",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!Array.isArray(user.following)) {
      user.following = [];
    }

    if (cleanUsername === user.username.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const index = user.following.findIndex(
      (item) => String(item).toLowerCase() === cleanUsername,
    );

    const isFollowing = index === -1;

    if (isFollowing) {
      user.following.push(cleanUsername);
    } else {
      user.following.splice(index, 1);
    }

    await user.save();

    res.json({
      success: true,
      following: user.following,
      isFollowing,
    });
  } catch (error) {
    console.error("Follow error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* EDIT PROFILE */

router.put("/:userId/profile", async (req, res) => {
  try {
    const { userId } = req.params;

    const { name, username, bio, avatar } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const cleanName = String(name || "").trim();

    const cleanUsername = String(username || "")
      .trim()
      .replace(/^@/, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    const cleanBio = String(bio || "").trim();

    const cleanAvatar =
      String(avatar || "")
        .trim()
        .charAt(0)
        .toUpperCase() || cleanName.charAt(0).toUpperCase();

    if (!cleanName || !cleanUsername) {
      return res.status(400).json({
        success: false,
        message: "Name and username are required",
      });
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can only contain letters, numbers, dots, underscores, and hyphens.",
      });
    }

    const duplicate = await User.findOne({
      username: cleanUsername,
      _id: { $ne: userId },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name: cleanName,
          username: cleanUsername,
          bio: cleanBio,
          avatar: cleanAvatar,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name username email bio avatar following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await Post.updateMany(
      { authorId: userId },
      {
        $set: {
          authorName: user.name,
          username: user.username,
          avatar: user.avatar,
        },
      },
    );

    res.json({
      success: true,
      message: "Profile updated successfully",

      user: {
        id: String(user._id),
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio || "",
        avatar: user.avatar || user.name.charAt(0).toUpperCase(),
        following: user.following || [],
      },
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
