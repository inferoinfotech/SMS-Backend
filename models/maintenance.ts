const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema(
  {
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resident",
      required: true,
    },
    maintenanceSetup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MaintenanceSetting",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    wing: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    residentStatus: {
      type: String,
      enum: ["Owner", "Tenant"],
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    penalty: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },
    payment: {
      type: String,
      enum: ["Cash", "Online", "Cheque", "UPI"],
      required: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
