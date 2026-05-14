const mongoose = require("mongoose");

const EventPaymentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
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
    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("EventPayment", EventPaymentSchema);
