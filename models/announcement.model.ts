const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  announcementType: {
    type: [String],
    enum: ["Notice", "Event", "Maintenance","Community Initiatives"],
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
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society",
    required: true,
  },
  amount: {
    type: Number,
  },
});

module.exports = mongoose.model("Announcement", announcementSchema);
