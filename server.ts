const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRouter = require("./routes/auth.router");
const societyRouter = require("./routes/society.router");
const residentRouter = require("./routes/resident.router");
const maintenanceRouter = require("./routes/maintenece");
const incomeRouter = require("./routes/income");
const logger = require("./config/logger");
const pinoHttp = require("pino-http")({
  logger,
  serializers: {
    req: (req: any) => ({
      method: req.method,
      url: req.url,
    }),
    res: (res: any) => ({
      statusCode: res.statusCode,
    }),
    err: (err: any) => ({
      message: err.message,
    }),
  },
});
const errorHandler = require("./middleware/error.middleware");
const expanseRouter = require("./routes/expanse.router");
const noteRouter = require("./routes/note.router");
const facilityRouter = require("./routes/facility.router");
const complainRouter = require("./routes/complain");
const requestTrackingRouter = require("./routes/requestTracking.router");
const securityProtocolRouter = require("./routes/securityProtocol.router");
const securityGuardRouter = require("./routes/securityGuard.router");
const announcementRouter = require("./routes/announcement.router");
const visitorRouter = require("./routes/visitor.router");
const importantNumberRouter = require("./routes/importantNumber.router");
const dashboardRouter = require("./routes/dashboard.router");
const eventPaymentRouter = require("./routes/eventPayment.router");
const emergencyRouter = require("./routes/emergency.router");
const paymentRouter = require("./routes/payment.routes");
const pollRouter = require("./routes/poll.router");
const chatRouter = require("./routes/chat.router");
const Chat = require("./models/chat.model");

const notificationRouter = require("./routes/notification.router");
const videoRouter = require("./routes/video.router");
const discussionRouter = require("./routes/community-discussion.router");

const { Server } = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);

// Security Middlewares
app.use(helmet()); // Sets various HTTP headers for security
app.set("trust proxy", 1); // Required for secure cookies behind proxies (Render/Vercel)

// Rate Limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limit specifically to auth routes in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth", limiter);
}

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://sms-frontend-v2.vercel.app",
]
  .map((url) => url?.replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // In production, strictly enforce allowed origins
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        // For development/debugging purposes, we can see why it's failing
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket: any) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (societyId: string) => {
    socket.join(societyId);
    console.log(`User ${socket.id} joined room: ${societyId}`);
  });

  socket.on("join-private", (userId: string) => {
    socket.join(userId);
    socket.userId = userId;
    io.emit("user-status-change", { userId, status: "online" });
    console.log(`User ${socket.id} joined private room: ${userId}`);
  });

  socket.on(
    "chat-message",
    async (data: {
      societyId: string;
      senderId: string;
      message: string;
      receiverId?: string;
      tempId?: string;
      fileUrl?: string;
      fileType?: string;
    }) => {
      try {
        let statusValue = "sent";
        if (data.receiverId) {
          const receiverRoom = io.sockets.adapter.rooms.get(data.receiverId);
          const isOnline = receiverRoom && receiverRoom.size > 0;
          if (isOnline) {
            statusValue = "delivered";
          }
        } else {
          statusValue = "delivered";
        }

        const newMessage = await Chat.create({
          sender: data.senderId,
          society: data.societyId,
          message: data.message,
          receiver: data.receiverId || null,
          tempId: data.tempId || null,
          fileUrl: data.fileUrl || null,
          fileType: data.fileType || null,
          status: statusValue,
        });

        const populatedMessage = await Chat.findById(newMessage._id)
          .populate("sender", "name firstname lastname profileImage")
          .populate("receiver", "name firstname lastname profileImage");

        if (data.receiverId) {
          io.to(data.receiverId)
            .to(data.senderId)
            .emit("new-message", populatedMessage);
        } else {
          io.to(data.societyId).emit("new-message", populatedMessage);
        }
      } catch (error) {
        console.error("Socket Chat Error:", error);
      }
    },
  );

  socket.on(
    "mark-read",
    async (data: {
      messageIds: string[];
      senderId: string;
      receiverId: string;
    }) => {
      try {
        if (!data.messageIds || data.messageIds.length === 0) return;

        await Chat.updateMany(
          { _id: { $in: data.messageIds } },
          { $set: { status: "read" } },
        );

        io.to(data.senderId).emit("messages-read", {
          messageIds: data.messageIds,
          receiverId: data.receiverId,
        });
      } catch (error) {
        console.error("Socket Mark Read Error:", error);
      }
    },
  );

  socket.on(
    "typing",
    (data: { societyId: string; senderId: string; receiverId?: string }) => {
      if (data.receiverId) {
        io.to(data.receiverId).emit("user-typing", {
          senderId: data.senderId,
          receiverId: data.receiverId,
        });
      } else {
        socket
          .to(data.societyId)
          .emit("user-typing", { senderId: data.senderId, isCommunity: true });
      }
    },
  );

  socket.on(
    "stop-typing",
    (data: { societyId: string; senderId: string; receiverId?: string }) => {
      if (data.receiverId) {
        io.to(data.receiverId).emit("user-stop-typing", {
          senderId: data.senderId,
          receiverId: data.receiverId,
        });
      } else {
        socket.to(data.societyId).emit("user-stop-typing", {
          senderId: data.senderId,
          isCommunity: true,
        });
      }
    },
  );

  socket.on(
    "call:incoming",
    (data: { to: string; from: string; callId: string; type: string }) => {
      io.to(data.to).emit("call:incoming", data);
    },
  );

  socket.on(
    "call:community-incoming",
    (data: {
      societyId: string;
      from: string;
      callId: string;
      type: string;
    }) => {
      socket.to(data.societyId).emit("call:incoming", data);
    },
  );

  socket.on(
    "call:rejected",
    (data: { to: string; from: string; callId: string }) => {
      if (data.to) {
        io.to(data.to).emit("call:rejected", data);
      }
    },
  );

  socket.on(
    "call:ended",
    (data: {
      to: string;
      societyId?: string;
      callId: string;
      isCommunity: boolean;
    }) => {
      if (data.isCommunity && data.societyId) {
        socket.to(data.societyId).emit("call:ended", data);
      } else if (data.to) {
        io.to(data.to).emit("call:ended", data);
      }
    },
  );

  socket.on("disconnect", () => {
    if (socket.userId) {
      const userRoom = io.sockets.adapter.rooms.get(socket.userId);
      const stillOnline = userRoom && userRoom.size > 0;
      if (!stillOnline) {
        io.emit("user-status-change", {
          userId: socket.userId,
          status: "offline",
        });
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(pinoHttp);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

connectDB();

app.use("/api/auth", authRouter);
app.use("/api/society", societyRouter);
app.use("/api/resident", residentRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expanse", expanseRouter);
app.use("/api/note", noteRouter);
app.use("/api/facility", facilityRouter);
app.use("/api/complain", complainRouter);
app.use("/api/request", requestTrackingRouter);
app.use("/api/security-protocol", securityProtocolRouter);
app.use("/api/security-guard", securityGuardRouter);
app.use("/api/announcement", announcementRouter);
app.use("/api/visitor", visitorRouter);
app.use("/api/important-number", importantNumberRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/event-payment", eventPaymentRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/poll", pollRouter);
app.use("/api/chat", chatRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/video", videoRouter);
app.use("/api/discussion", discussionRouter);

app.use(errorHandler);

server.listen(process.env.PORT || 5000, () => {
  logger.info(`Server is running on port ${process.env.PORT || 5000}`);
});
