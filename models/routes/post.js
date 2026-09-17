const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");

const router = express.Router();

const validObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

function serializePost(post, userId) {
  const id = String(userId || "");

  const likes = Array.isArray(post.likes)
    ? post.likes
    : [];

  const reposts = Array.isArray(post.reposts)
    ? post.reposts
    : [];

  const bookmarks = Array.isArray(post.bookmarks)
    ? post.bookmarks
    : [];

  return {
    ...post.toObject(),

    id: String(post._id),

    likeCount: likes.length,

    repostCount: reposts.length,

    liked: likes.some(
      (item) => String(item) === id,
    ),

    reposted: reposts.some(
      (item) => String(item) === id,
    ),

    bookmarked: bookmarks.some(
      (item) => String(item) === id,
    ),

    comments: Array.isArray(post.comments)
      ? post.comments.map((comment) => ({
          id: String(comment._id),
          authorId: String(comment.authorId),
          authorName: comment.authorName,
          username: comment.username,
          avatar: comment.avatar,
          text: comment.text,
          createdAt: comment.createdAt,
        }))
      : [],
  };
}

/* CREATE POST */

router.post("/", async (req, res) => {
  try {
    const {
      authorId,
      authorName,
      username,
      avatar,
      text,
      image,
    } = req.body;

    if (!validObjectId(authorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID",
      });
    }

    if (
      !authorName ||
      !username ||
      !text?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required post information is missing",
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
      post: serializePost(post, authorId),
    });
  } catch (error) {
    console.error(
      "Create post error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* GET POSTS */

router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (
      userId &&
      !validObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const posts = await Post.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      posts: posts.map((post) =>
        serializePost(post, userId),
      ),
    });
  } catch (error) {
    console.error(
      "Get posts error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* DELETE POST */

router.delete("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (
      !validObjectId(postId) ||
      !validObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (
      String(post.authorId) !==
      String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete your own posts",
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete post error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* LIKE / UNLIKE */

router.post("/:postId/like", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (
      !validObjectId(postId) ||
      !validObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    const index = post.likes.findIndex(
      (id) =>
        String(id) === String(userId),
    );

    const isAdding = index === -1;

    if (isAdding) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    res.json({
      success: true,
      liked: isAdding,
      likeCount: post.likes.length,
      post: serializePost(post, userId),
    });
  } catch (error) {
    console.error(
      "Like error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* REPOST / UNREPOST */

router.post("/:postId/repost", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (
      !validObjectId(postId) ||
      !validObjectId(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (!Array.isArray(post.reposts)) {
      post.reposts = [];
    }

    const index = post.reposts.findIndex(
      (id) =>
        String(id) === String(userId),
    );

    const isAdding = index === -1;

    if (isAdding) {
      post.reposts.push(userId);
    } else {
      post.reposts.splice(index, 1);
    }

    await post.save();

    res.json({
      success: true,
      reposted: isAdding,
      repostCount: post.reposts.length,
      post: serializePost(post, userId),
    });
  } catch (error) {
    console.error(
      "Repost error:",
      error.message,
    );

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* BOOKMARK / UNBOOKMARK */

router.post(
  "/:postId/bookmark",
  async (req, res) => {
    try {
      const { postId } = req.params;
      const { userId } = req.body;

      if (
        !validObjectId(postId) ||
        !validObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (!Array.isArray(post.bookmarks)) {
        post.bookmarks = [];
      }

      const index =
        post.bookmarks.findIndex(
          (id) =>
            String(id) === String(userId),
        );

      const isAdding = index === -1;

      if (isAdding) {
        post.bookmarks.push(userId);
      } else {
        post.bookmarks.splice(index, 1);
      }

      await post.save();

      res.json({
        success: true,
        bookmarked: isAdding,
        post: serializePost(post, userId),
      });
    } catch (error) {
      console.error(
        "Bookmark error:",
        error.message,
      );

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

/* COMMENTS */

router.post(
  "/:postId/comments",
  async (req, res) => {
    try {
      const { postId } = req.params;

      const {
        authorId,
        authorName,
        username,
        avatar,
        text,
      } = req.body;

      if (
        !validObjectId(postId) ||
        !validObjectId(authorId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID",
        });
      }

      if (
        !authorName ||
        !username ||
        !text?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
        });
      }

      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      if (!Array.isArray(post.comments)) {
        post.comments = [];
      }

      post.comments.push({
        authorId,
        authorName,
        username,
        avatar: avatar || "U",
        text: text.trim(),
      });

      await post.save();

      const comment =
        post.comments[
          post.comments.length - 1
        ];

      res.status(201).json({
        success: true,
        message:
          "Comment added successfully",

        comment: {
          id: String(comment._id),
          authorId: String(
            comment.authorId,
          ),
          authorName:
            comment.authorName,
          username:
            comment.username,
          avatar: comment.avatar,
          text: comment.text,
          createdAt:
            comment.createdAt,
        },

        post: serializePost(
          post,
          authorId,
        ),
      });
    } catch (error) {
      console.error(
        "Comment error:",
        error.message,
      );

      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },
);

module.exports = router;