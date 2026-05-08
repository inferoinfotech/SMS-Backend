const mongoose = require("mongoose");

const securityGuardSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  shift: {
    type: String,
    enum: ["Day", "Night"],
    required: true,
    default: "Day",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
    default: "Male",
  },
  shiftDate: {
    type: Date,
    required: true,
  },
  shiftTime: {
    type: String,
    required: true,
  },
  uploadAadhar: {
    type: String,
    required: true,
    default: "",
  },
  email:{
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
});

module.exports = mongoose.model("SecurityGuard", securityGuardSchema);
