const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  announcementType: {
    type: [String],
    enum: ["Notice", "Event", "Maintenance"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
    default: () => new Date().toLocaleTimeString(),
  },

  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("Announcement", announcementSchema);
