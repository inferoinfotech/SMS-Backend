const mongoose = require("mongoose");

const societySchema = new mongoose.Schema({
  societyName: {
    type: String,
    required: true,
    trim: true,
  },
  societyAddress: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
  },
  
});

societySchema.index({ societyName: 1 }, { unique: true });

module.exports = mongoose.model("Society", societySchema);
