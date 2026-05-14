const mongoose = require("mongoose");

const PollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pollType: {
      type: String,
      enum: ["Multichoice", "Ranking", "Rating", "Numeric", "Text"],
      required: true,
    },
    allowMultipleAnswers: {
      type: Boolean,
      default: false,
    },
    options: [
      {
        text: String,
        votes: { type: Number, default: 0 },
      },
    ],
    ratingScale: {
      type: Number,
      default: 5,
    },
    minValue: {
      type: Number,
    },
    maxValue: {
      type: Number,
    },
    unit: {
      type: String,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Closed", "Inactive"],
      default: "Active",
    },
    voters: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Auth" },
        choices: [{ type: String }], // For Multichoice
        votedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Poll", PollSchema);
