const mongoose = require("mongoose");

const ComplainSchema = new mongoose.Schema(
  {
    compainerName: {
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
    complainName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Pending", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
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

module.exports = mongoose.model("Complain", ComplainSchema);
