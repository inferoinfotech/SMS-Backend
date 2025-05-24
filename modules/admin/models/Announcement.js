const mongoose = require('mongoose');
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 10); // Generates a random string of 8 characters
};

const announcementSchema = new mongoose.Schema(
  {
    Announcement_type: {
      type: Boolean,
      required: true,
    },
    Announcement_title: {
      type: String,
      required: true,
    },
    amount: { 
      type: Number, 
      required: true 
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
    },
    description: {
      type: String,
      required: true,
    },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident',},
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    status: {
      type: String,
      enum: ['Pending', 'Done', 'Rejected'],
      default: 'Pending',
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['Online', 'Cash'],
    },
    invoiceId: {
      type: String,
      default: generateUniqueId,
    },
    paymentDate: {
        type: Date,
        default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    participatorId: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
