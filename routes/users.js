const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

/* =========================
HELPER
========================= */

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/* =========================
GET FOLLOWING
========================= */

router.get("/:userId/following", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validObjectId(userId)) {
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

    const following = Array.isArray(user.following) ? user.following : [];

    res.json({
      success: true,
      following,
    });
  } catch (error) {
    console.error("Get following error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
FOLLOW / UNFOLLOW
========================= */

router.post("/:userId/follow", async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    if (!validObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!username || !username.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ownUsername = String(user.username).toLowerCase();

    if (cleanUsername === ownUsername) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    if (!Array.isArray(user.following)) {
      user.following = [];
    }

    const existingIndex = user.following.findIndex(
      (item) => String(item).toLowerCase() === cleanUsername,
    );

    let isFollowing;

    if (existingIndex >= 0) {
      user.following.splice(existingIndex, 1);
      isFollowing = false;
    } else {
      user.following.push(cleanUsername);
      isFollowing = true;
    }

    await user.save();

    res.json({
      success: true,
      message: isFollowing
        ? "User followed successfully"
        : "User unfollowed successfully",
      isFollowing,
      following: user.following,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error("Follow error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
UPDATE PROFILE
========================= */

router.put("/:userId/profile", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, username, bio, avatar } = req.body;

    if (!validObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (!name?.trim() || !username?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and username are required",
      });
    }

    const cleanUsername = username
      .trim()
      .replace(/\s+/g, "")
      .replace(/^@/, "")
      .toLowerCase();

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can only contain letters, numbers, dots, underscores, and hyphens.",
      });
    }

    const existingUser = await User.findOne({
      username: cleanUsername,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "That username is already taken.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldUsername = user.username;

    user.name = name.trim();
    user.username = cleanUsername;
    user.bio = bio?.trim() || "";
    user.avatar = avatar?.trim() || user.name.charAt(0).toUpperCase();

    await user.save();

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

    if (oldUsername !== user.username) {
      await User.updateMany(
        { following: oldUsername },
        {
          $set: {
            "following.$": user.username,
          },
        },
      );
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
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
    console.error("Profile update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
