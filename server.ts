const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
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
const announcementRouter = require("./routes/Announcement.router");
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


const { Server } = require("socket.io");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket: any) => {
  console.log(`User connected: ${socket.id}`);

  // Join a society-specific room
  socket.on("join-room", (societyId: string) => {
    socket.join(societyId);
    console.log(`User ${socket.id} joined room: ${societyId}`);
  });

  // Join a private room for personal messages
  socket.on("join-private", (userId: string) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined private room: ${userId}`);
  });

  // Handle chat messages (both Community and Personal)
  socket.on(
    "chat-message",
    async (data: {
      societyId: string;
      senderId: string;
      message: string;
      receiverId?: string;
      tempId?: string;
    }) => {
      try {
        // Save message to database
        const newMessage = await Chat.create({
          sender: data.senderId,
          society: data.societyId,
          message: data.message,
          receiver: data.receiverId || null,
          tempId: data.tempId || null,
        });

        // Populate sender info for the frontend
        const populatedMessage = await Chat.findById(newMessage._id)
          .populate("sender", "name firstname lastname profileImage")
          .populate("receiver", "name firstname lastname profileImage");

        if (data.receiverId) {
          // Personal (1-to-1) Message: Emit only to sender and receiver
          io.to(data.receiverId)
            .to(data.senderId)
            .emit("new-message", populatedMessage);
        } else {
          // Community Forum Message: Broadcast to everyone in the society room
          io.to(data.societyId).emit("new-message", populatedMessage);
        }
      } catch (error) {
        console.error("Socket Chat Error:", error);
      }
    },
  );

  // Typing Indicators
  socket.on("typing", (data: { societyId: string; senderId: string; receiverId?: string }) => {
    if (data.receiverId) {
      io.to(data.receiverId).emit("user-typing", { senderId: data.senderId, receiverId: data.receiverId });
    } else {
      socket.to(data.societyId).emit("user-typing", { senderId: data.senderId, isCommunity: true });
    }
  });

  socket.on("stop-typing", (data: { societyId: string; senderId: string; receiverId?: string }) => {
    if (data.receiverId) {
      io.to(data.receiverId).emit("user-stop-typing", { senderId: data.senderId, receiverId: data.receiverId });
    } else {
      socket.to(data.societyId).emit("user-stop-typing", { senderId: data.senderId, isCommunity: true });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
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


app.use(errorHandler);

server.listen(process.env.PORT || 5000, () => {
  logger.info(`Server is running on port ${process.env.PORT || 5000}`);
});
