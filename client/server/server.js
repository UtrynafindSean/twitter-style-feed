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
    credentials: true,
  },
  transports: ["polling", "websocket"],
});

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

/* =========================
   MODELS
========================= */

const Message = require("../../models/Message");

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
   MESSAGE API
========================= */

/*
GET CONVERSATION
/api/messages/:userId/:otherUserId
*/

app.get("/api/messages/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

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
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load messages",
    });
  }
});

/*
MARK CONVERSATION AS READ
/api/messages/:userId/:otherUserId/read
*/

app.post("/api/messages/:userId/:otherUserId/read", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(otherUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      {
        $set: { read: true },
      },
    );

    res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark messages read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to mark messages as read",
    });
  }
});

/* =========================
   ONLINE USERS
========================= */

const onlineUsers = new Map();

/* =========================
   SOCKET.IO
========================= */

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  /* =========================
     USER ONLINE
  ========================= */

  socket.on("user-online", (userId) => {
    if (!userId) return;

    const id = String(userId);

    onlineUsers.set(id, socket.id);
    socket.userId = id;

    console.log("User online:", id);

    io.emit("user-status", {
      userId: id,
      online: true,
    });
  });

  /* =========================
     SEND MESSAGE
  ========================= */

  socket.on("send-message", async (message, callback) => {
    try {
      if (!message) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Message data is required",
          });
        }

        return;
      }

      const { senderId, senderUsername, receiverId, body } = message;

      if (!senderId || !receiverId || !body?.trim()) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Sender, receiver and message are required",
          });
        }

        return;
      }

      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Invalid sender or receiver ID",
          });
        }

        return;
      }

      /* =========================
         SAVE MESSAGE
      ========================= */

      const savedMessage = await Message.create({
        senderId,
        senderUsername: senderUsername || "",
        receiverId,
        body: body.trim(),
        read: false,
      });

      const messageToSend = {
        id: String(savedMessage._id),
        senderId: String(savedMessage.senderId),
        senderUsername: savedMessage.senderUsername,
        receiverId: String(savedMessage.receiverId),
        body: savedMessage.body,
        read: savedMessage.read,
        createdAt: savedMessage.createdAt,
      };

      console.log(`Message saved: ${senderId} -> ${receiverId}`);

      /* =========================
         SEND TO RECEIVER
      ========================= */

      const receiverSocket = onlineUsers.get(String(receiverId));

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", messageToSend);

        console.log("Message delivered to:", receiverId);
      } else {
        console.log("Receiver is offline:", receiverId);
      }

      /* =========================
         CONFIRM TO SENDER
      ========================= */

      socket.emit("message-sent", messageToSend);

      if (typeof callback === "function") {
        callback({
          success: true,
          message: messageToSend,
        });
      }
    } catch (error) {
      console.error("Send message error:", error);

      if (typeof callback === "function") {
        callback({
          success: false,
          message: "Unable to send message",
        });
      }
    }
  });

  /* =========================
     DISCONNECT
  ========================= */

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    if (socket.userId) {
      const currentSocket = onlineUsers.get(socket.userId);

      if (currentSocket === socket.id) {
        onlineUsers.delete(socket.userId);

        io.emit("user-status", {
          userId: socket.userId,
          online: false,
        });
      }
    }
  });
});

/* =========================
   DATABASE
========================= */

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

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
