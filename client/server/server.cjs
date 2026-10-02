const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

/* =========================================================
   ENVIRONMENT
========================================================= */

const envPath = path.join(__dirname, ".env");

dotenv.config({
  path: envPath,
});

console.log("Loading .env from:", envPath);
console.log(
  "MONGO_URI:",
  process.env.MONGO_URI ? "loaded" : "missing",
);

/* =========================================================
   APP
========================================================= */

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

/* =========================================================
   SOCKET.IO
========================================================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },

  transports: ["polling", "websocket"],
});

/* =========================================================
   MODELS
========================================================= */

/*
  Your actual files are:

  Twitter Style Feed
  └── models
      ├── user.js
      ├── post.js
      ├── message.js
      └── routes
          ├── user.js
          ├── post.js
          └── auth.js

  This server is inside:

  Twitter Style Feed
  └── client
      └── server
          └── server.cjs

  Therefore ../../models/... is correct.
*/

const Message = require("../../models/message");

/* =========================================================
   ROUTES
========================================================= */

const userRoutes = require("../../models/routes/user");
const postRoutes = require("../../models/routes/post");
const authRoutes = require("../../models/routes/auth");

/* =========================================================
   API ROUTES
========================================================= */

/*
  USER ROUTES

  GET    /api/users
  GET    /api/users/:userId/following
  GET    /api/users/:userId/followers-count
  POST   /api/users/:userId/follow
  PUT    /api/users/:userId/profile
*/

app.use("/api/users", userRoutes);

/*
  POST ROUTES

  Your post route file controls:

  /api/posts/...
*/

app.use("/api/posts", postRoutes);

/*
  AUTH ROUTES

  Your auth route file controls:

  /api/auth/...
*/

app.use("/api/auth", authRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Twitter-style backend is running",
  });
});

/* =========================================================
   MESSAGE API
========================================================= */

/*
  GET CONVERSATION

  GET
  /api/messages/:userId/:otherUserId
*/

app.get(
  "/api/messages/:userId/:otherUserId",
  async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;

      /* -------------------------
         Validate IDs
      ------------------------- */

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(otherUserId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      /* -------------------------
         Find messages
      ------------------------- */

      const messages = await Message.find({
        $or: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      }).sort({
        createdAt: 1,
      });

      res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error,
      );

      res.status(500).json({
        success: false,
        message: "Unable to load messages",
      });
    }
  },
);

/* =========================================================
   MARK MESSAGES AS READ
========================================================= */

/*
  POST
  /api/messages/:userId/:otherUserId/read
*/

app.post(
  "/api/messages/:userId/:otherUserId/read",
  async (req, res) => {
    try {
      const { userId, otherUserId } = req.params;

      /* -------------------------
         Validate IDs
      ------------------------- */

      if (
        !mongoose.Types.ObjectId.isValid(userId) ||
        !mongoose.Types.ObjectId.isValid(otherUserId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      /* -------------------------
         Mark messages as read
      ------------------------- */

      await Message.updateMany(
        {
          senderId: otherUserId,
          receiverId: userId,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        },
      );

      res.json({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      console.error(
        "Mark messages read error:",
        error,
      );

      res.status(500).json({
        success: false,
        message: "Unable to mark messages as read",
      });
    }
  },
);

/* =========================================================
   ONLINE USERS
========================================================= */

const onlineUsers = new Map();

/* =========================================================
   SOCKET.IO CONNECTION
========================================================= */

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id,
  );

  /* =======================================================
     USER ONLINE
  ======================================================= */

  socket.on("user-online", (userId) => {
    if (!userId) {
      return;
    }

    const id = String(userId);

    onlineUsers.set(id, socket.id);

    socket.userId = id;

    console.log(
      "User online:",
      id,
    );

    io.emit("user-status", {
      userId: id,
      online: true,
    });
  });

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  socket.on(
    "send-message",
    async (message, callback) => {
      try {
        /* -------------------------
           Validate message object
        ------------------------- */

        if (!message) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message: "Message data is required",
            });
          }

          return;
        }

        const {
          senderId,
          senderUsername,
          receiverId,
          body,
        } = message;

        /* -------------------------
           Validate message fields
        ------------------------- */

        if (
          !senderId ||
          !receiverId ||
          !body ||
          !body.trim()
        ) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message:
                "Sender, receiver and message are required",
            });
          }

          return;
        }

        /* -------------------------
           Validate MongoDB IDs
        ------------------------- */

        if (
          !mongoose.Types.ObjectId.isValid(senderId) ||
          !mongoose.Types.ObjectId.isValid(receiverId)
        ) {
          if (typeof callback === "function") {
            callback({
              success: false,
              message:
                "Invalid sender or receiver ID",
            });
          }

          return;
        }

        /* =================================================
           SAVE MESSAGE TO MONGODB
        ================================================= */

        const savedMessage =
          await Message.create({
            senderId,
            senderUsername:
              senderUsername || "",
            receiverId,
            body: body.trim(),
            read: false,
          });

        /* =================================================
           FORMAT MESSAGE
        ================================================= */

        const messageToSend = {
          id: String(savedMessage._id),

          senderId: String(
            savedMessage.senderId,
          ),

          senderUsername:
            savedMessage.senderUsername,

          receiverId: String(
            savedMessage.receiverId,
          ),

          body: savedMessage.body,

          read: savedMessage.read,

          createdAt:
            savedMessage.createdAt,
        };

        console.log(
          `Message saved: ${senderId} -> ${receiverId}`,
        );

        /* =================================================
           SEND TO RECEIVER IF ONLINE
        ================================================= */

        const receiverSocket =
          onlineUsers.get(
            String(receiverId),
          );

        if (receiverSocket) {
          io.to(receiverSocket).emit(
            "receive-message",
            messageToSend,
          );

          console.log(
            "Message delivered to:",
            receiverId,
          );
        } else {
          console.log(
            "Receiver is offline:",
            receiverId,
          );
        }

        /* =================================================
           CONFIRM MESSAGE TO SENDER
        ================================================= */

        socket.emit(
          "message-sent",
          messageToSend,
        );

        /* =================================================
           ACKNOWLEDGE FRONTEND
        ================================================= */

        if (typeof callback === "function") {
          callback({
            success: true,
            message: messageToSend,
          });
        }
      } catch (error) {
        console.error(
          "Send message error:",
          error,
        );

        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Unable to send message",
          });
        }
      }
    },
  );

  /* =======================================================
     DISCONNECT
  ======================================================= */

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id,
    );

    if (!socket.userId) {
      return;
    }

    const currentSocket =
      onlineUsers.get(
        socket.userId,
      );

    /*
      Only remove the user if this exact
      socket is still registered.

      This prevents an older connection
      from deleting a newer connection.
    */

    if (currentSocket === socket.id) {
      onlineUsers.delete(
        socket.userId,
      );

      io.emit("user-status", {
        userId: socket.userId,
        online: false,
      });
    }
  });
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* =========================================================
   DATABASE + SERVER
========================================================= */

async function startServer() {
  try {
    /* -------------------------
       Check MongoDB URI
    ------------------------- */

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env",
      );
    }

    /* -------------------------
       Connect MongoDB
    ------------------------- */

    await mongoose.connect(
      process.env.MONGO_URI,
    );

    console.log(
      "MongoDB connected successfully",
    );

    /* -------------------------
       Start HTTP server
    ------------------------- */

    server.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`,
        );

        console.log(
          "Socket.IO is ready",
        );
      },
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
    );

    console.error(
      error.message,
    );

    process.exit(1);
  }
}

/* =========================================================
   START
========================================================= */

startServer();

