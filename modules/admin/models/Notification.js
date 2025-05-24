const mongoose = require('mongoose');
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 10); // Generates a random string of 8 characters
};

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'senderModel',
    required: true
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Resident']
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'receiverModel',
    required: true
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Resident']
  },
  type: {
    type: String,
    enum: ['PAYMENT', 'MAINTENANCE', 'FUND', 'OTHER', 'PAYMENT_STATUS'],
    required: true
  },
  announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement'},
  maintenanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Maintenance'},
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  amount: {
    type: Number
  },
  // status: {
  //   type: String,
  //   enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
  //   default: 'PENDING'
  // },
  status: {
    type: String,
    enum: ['Pending', 'Done', 'Rejected'],
    default: 'Pending',
    required: true,
  },
  read: {
    type: Boolean,
    default: false
  },
  paymentType: {
    type: String,
    enum: ['Online', 'Cash'],
  },
  invoiceId: {
    type: String,
    default: generateUniqueId,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports =  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);