const mongoose = require('mongoose');

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Resident']
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  deviceType: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
deviceTokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Use this pattern to prevent model overwriting
const DeviceToken = mongoose.models.DeviceToken || mongoose.model('DeviceToken', deviceTokenSchema);

module.exports = DeviceToken; 