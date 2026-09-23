const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

console.log("Loading .env from:", envPath);
console.log("MONGO_URI:", process.env.MONGO_URI ? "loaded" : "missing");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/* =========================
   SOCKET.IO
========================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Twitter-style backend is running",
  });
});

/* =========================
   SOCKET USERS
========================= */

const onlineUsers = new Map();

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /* =========================
     JOIN USER
  ========================= */

  socket.on("join_user", ({ userId }) => {
    if (!userId) {
      console.log("join_user called without userId");
      return;
    }

    const id = String(userId);

    socket.userId = id;

    // Put this user's socket into their own private room
    socket.join(`user:${id}`);

    onlineUsers.set(id, socket.id);

    console.log(`User ${id} joined Socket.IO`);

    io.emit("user-status", {
      userId: id,
      online: true,
    });
  });

  /* =========================
     SEND MESSAGE
  ========================= */

  socket.on("send_message", async (message, callback) => {
    try {
      if (!socket.userId) {
        if (callback) {
          callback({
            success: false,
            message: "Socket is not connected to a user.",
          });
        }

        return;
      }

      const receiverId = message?.receiverId;
      const body = message?.body;

      if (!receiverId || !body?.trim()) {
        if (callback) {
          callback({
            success: false,
            message: "Receiver and message are required.",
          });
        }

        return;
      }

      const normalizedMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId: String(socket.userId),
        receiverId: String(receiverId),
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };

      console.log(`Message: ${socket.userId} -> ${receiverId}: ${body.trim()}`);

      /* Send to receiver */
      io.to(`user:${String(receiverId)}`).emit(
        "new_message",
        normalizedMessage,
      );

      /* Send back to sender */
      io.to(`user:${String(socket.userId)}`).emit(
        "new_message",
        normalizedMessage,
      );

      if (callback) {
        callback({
          success: true,
          message: normalizedMessage,
        });
      }
    } catch (error) {
      console.error("Socket message error:", error);

      if (callback) {
        callback({
          success: false,
          message: "Failed to send message.",
        });
      }
    }
  });

  /* =========================
     DISCONNECT
  ========================= */

  socket.on("disconnect", () => {
    if (socket.userId) {
      const userId = String(socket.userId);

      // Only remove the user if this is still their active socket
      if (onlineUsers.get(userId) === socket.id) {
        onlineUsers.delete(userId);

        io.emit("user-status", {
          userId,
          online: false,
        });
      }
    }

    console.log("Socket disconnected:", socket.id);
  });
});

/* =========================
   DATABASE
========================= */

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Socket.IO is ready");
    });
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
  }
}

startServer();
