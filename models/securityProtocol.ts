const mongoose = require("mongoose");

const securityProtocolSchema = new mongoose.Schema({
  title: {
    type: String,
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

module.exports = mongoose.model("SecurityProtocol", securityProtocolSchema);
