// controllers/notificationController.js
const Notification = require('./modules/admin/models/Notification');
const { getIO, getOnlineUsers } = require('./socketUtil');

exports.createNotification = async (req, res) => {
  try {
    const { sender, receiver, type, title, message, amount } = req.body;
    const notification = new Notification({
      sender,
      receiver,
      type,
      title,
      message,
      amount
    });
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 
    const userRole = req.user.role;
    let notifications;
    console.log(await Notification.find());
    if(userRole !== 'admin') {
        notifications = await Notification.find({sender: userId})
          .populate('sender')
          .populate('receiver')
          .exec();
    } else {
        notifications = await Notification.find({receiver: userId, status: 'Pending'})
          .populate('sender')
          .populate('receiver')
          .exec();
    }

    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const socketId = onlineUsers.get(userId);
    
    if (socketId) {
      io.to(socketId).emit('newNotification', notifications);
    }
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNotificationStatus = async (req, res) => {
  try {
    const { notificationId, status } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};