const express = require("express");
const mongoose = require("mongoose");

const User = require("../user");
const Post = require("../post");

const router = express.Router();

/* =========================
   HELPER
========================= */

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

/* =========================
   GET ALL USERS
========================= */

router.get("/", async (req, res) => {
  try {
    const { viewerId } = req.query;

    const users = await User.find({})
      .select("name username avatar bio following")
      .sort({ createdAt: -1 });

    let viewer = null;

    if (viewerId && validObjectId(viewerId)) {
      viewer = await User.findById(viewerId).select("username following");
    }

    const viewerFollowing = Array.isArray(viewer?.following)
      ? viewer.following.map((username) => String(username).toLowerCase())
      : [];

    const formattedUsers = users.map((user) => {
      const username = String(user.username).toLowerCase();

      const isFollowing = viewerFollowing.includes(username);

      const isFollowedBy = viewer
        ? Array.isArray(user.following) &&
          user.following.some(
            (followingUsername) =>
              String(followingUsername).toLowerCase() ===
              String(viewer.username).toLowerCase(),
          )
        : false;

      const followersCount = users.filter(
        (otherUser) =>
          Array.isArray(otherUser.following) &&
          otherUser.following.some(
            (followingUsername) =>
              String(followingUsername).toLowerCase() === username,
          ),
      ).length;

      return {
        id: String(user._id),
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        following: user.following || [],
        isFollowing,
        isFollowedBy,
        followersCount,
      };
    });

    res.json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

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

    res.json({
      success: true,
      following: Array.isArray(user.following) ? user.following : [],
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
   GET FOLLOWERS COUNT
========================= */

router.get("/:userId/followers-count", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!validObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId).select("username");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followersCount = await User.countDocuments({
      following: user.username,
    });

    res.json({
      success: true,
      followersCount,
    });
  } catch (error) {
    console.error("Get followers count error:", error);

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

    if (!username?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const cleanUsername = username.trim().replace(/^@/, "").toLowerCase();

    const targetUser = await User.findOne({
      username: cleanUsername,
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User to follow was not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (String(user.username).toLowerCase() === cleanUsername) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    if (!Array.isArray(user.following)) {
      user.following = [];
    }

    const index = user.following.findIndex(
      (item) => String(item).toLowerCase() === cleanUsername,
    );

    let isFollowing;

    if (index === -1) {
      user.following.push(cleanUsername);
      isFollowing = true;
    } else {
      user.following.splice(index, 1);
      isFollowing = false;
    }

    await user.save();

    res.json({
      success: true,
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
      .replace(/^@/, "")
      .replace(/\s+/g, "")
      .toLowerCase();

    if (!/^[a-zA-Z0-9._-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can only contain letters, numbers, dots, underscores and hyphens.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

    const oldUsername = user.username;

    user.name = name.trim();
    user.username = cleanUsername;
    user.bio = bio?.trim() || "";
    user.avatar =
      avatar?.trim()?.charAt(0)?.toUpperCase() ||
      user.name.charAt(0).toUpperCase() ||
      "U";

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

    if (
      String(oldUsername).toLowerCase() !== String(user.username).toLowerCase()
    ) {
      await User.updateMany(
        {
          following: oldUsername,
        },
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
