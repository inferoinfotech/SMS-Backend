const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const helmet = require('helmet');
const path = require('path');
// const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const adminRoutes = require('./modules/admin');
const residentRoutes = require('./modules/Resident');
const securityRoutes = require('./modules/Security');
const { chatController } = require('./modules/Resident/controllers');
const Admin = require('./modules/admin/models/Admin.js');
const Resident = require('./modules/admin/models/Resident.js');
const morgan = require("morgan");
const Notification = require('./modules/admin/models/Notification.js');
const notificationRoutes = require('./notificationRoutes');
const {middleware} = require('./middleware');
const app = express();
const { initSocket } = require('./socketUtil');


// Connect to MongoDB
connectDB().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Set security HTTP headers using Helmet
helmet({
  crossOriginResourcePolicy: false,
})

// CORS configuration
app.use(cors({
  origin: ["https://neigborr-frontend-1-divyang-swiftruts-projects.vercel.app", "http://localhost:3030", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

app.use(cookieParser());

// Rate limiting: Limit requests from the same IP
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 10,
//   message: 'Too many requests from this IP, please try again later',
// });
// app.use(limiter);

// Data sanitization against XSS (cross-site scripting)
app.use(xss());
app.use(morgan('dev'));
// Prevent HTTP Parameter Pollution
app.use(hpp());

// Body parser to read request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// scheduleReminders();
// console.log(scheduleReminders);

// Middleware for serving static files (images) from 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'modules', 'admin', 'uploads')));
// app.use('/uploads', express.static(path.join(__dirname, 'modules', 'resident', 'uploads')));

app.use('/admin/api', adminRoutes);
app.use('/resident/api', residentRoutes);
app.use('/security/api', securityRoutes);
app.use('/notification/api',middleware, notificationRoutes);


// Health check and version endpoint
const appVersion = '1.0.0'; // Update this with your app version
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: appVersion,
    timestamp: new Date().toISOString(),
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://neigborr-frontend-1-divyang-swiftruts-projects.vercel.app", "http://localhost:3030", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
});

// Initialize socket utility with io instance
initSocket(io);

const onlineUsers = new Map();

// Notification handler function
const createAndSendNotification = async ({
  senderId,
  receiverId,
  type,
  title,
  message,
  amount = null,
  announcementId = null,
  paymentType = null,
  invoiceId = null,
  maintenanceId = null,
  maintenanceAmount = null
}) => {

  try {
    // Create notification in database
    const notification = new Notification({
      sender: senderId,
      senderModel: 'Admin',
      receiver: receiverId,
      receiverModel: 'Resident',
      type,
      title,
      message,
      amount,
      announcementId,
      paymentType,
      invoiceId,
      maintenanceId,
      maintenanceAmount
    });
    await notification.save();

    // Send real-time notification
    const socketId = onlineUsers.get(receiverId);
    if (socketId) {
      io.to(socketId).emit('newNotification', notification);
    }
    console.log("notification------------------------------", notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

io.on("connection", (socket) => {

  socket.on("join", ({ userId, receiverId }) => {
    socket.userId = userId;
    socket.receiverId = receiverId;
  });

  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  // Handle payment notifications
  socket.on('sendNotification', async ({ announcementId, maintenanceId, message, type, currentUserId, role, notificationType }) => {
    try {
      const resident = await Resident.findById(currentUserId)
      console.log(announcementId,',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,')
      console.log(maintenanceId,',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,')

      
      switch (type) {
        case 'cash_payment':
          // Notify admin about new cash payment request
          await createAndSendNotification({
            senderId: currentUserId,
            receiverId: resident.createdBy,
            type: 'PAYMENT',
            title: 'New Cash Payment Request',
            message: `New cash payment request from ${resident.firstName} for ${notificationType==="maintenance" ? "maintenance" : "announcement" }`,
            announcementId,
            maintenanceId,
            paymentType: 'Cash',
          });
          break;

        case 'payment_status':
          // Notify resident about payment status
          await createAndSendNotification({
            senderId: currentUserId,
            receiverId: resident._id,
            type: 'PAYMENT_STATUS',
            title: message.title,
            message: message.message,
            status: message.status,
            paymentType: 'Cash'
          });
          break;

        case 'new_announcement':
          // Notify all residents about new announcement
          const residents = await Resident.find();
          for (const resident of residents) {
            await createAndSendNotification({
              senderId: currentUserId,
              receiverId: resident._id,
              type: 'ANNOUNCEMENT',
              title: 'New Announcement',
              message: message,
              announcementId,
              maintenanceId
            });
          }
          break;

      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  });

  socket.on("message", ({ senderId, receiverId, message, mediaUrl }) => {
    try {
      const newMessage = { senderId, receiverId, message, mediaUrl };
      console.log("newMessage", newMessage);
      if (senderId === receiverId) {
        io.to(socket.id).emit("message", newMessage);
      } else {
        io.to(socket.id).emit("message", newMessage);
        const receiverSocket = Array.from(io.sockets.sockets.values()).find(
          (s) => s.userId === receiverId
        );
        if (receiverSocket) {
          receiverSocket.emit("message", newMessage);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });
 
  socket.on("dummy", (data) => {
    console.log("dummy", data);
  });

  socket.on("disconnect", () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server Listening at PORT - ${PORT}`);
});

module.exports = {io, onlineUsers};
