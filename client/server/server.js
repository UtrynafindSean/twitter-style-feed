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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Twitter-style backend is running",
  });
});

/* =========================
   SOCKET.IO
========================= */

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user-online", (userId) => {
    if (!userId) return;

    onlineUsers.set(String(userId), socket.id);

    socket.userId = String(userId);

    io.emit("user-status", {
      userId: String(userId),
      online: true,
    });
  });

  socket.on("send-message", async (message) => {
    try {
      if (!message) return;

      const receiverSocket = onlineUsers.get(String(message.receiverId));

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", message);
      }

      socket.emit("message-sent", message);
    } catch (error) {
      console.error("Socket message error:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      io.emit("user-status", {
        userId: socket.userId,
        online: false,
      });
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
