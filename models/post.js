const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "U",
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String,
      default: "U",
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    reposts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    bookmarks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Post", postSchema);
