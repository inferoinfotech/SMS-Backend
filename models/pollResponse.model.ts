const mongoose = require("mongoose");

const PollResponseSchema = new mongoose.Schema(
  {
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    responseType: {
      type: String,
      enum: ["Multichoice", "Ranking", "Rating", "Numeric", "Text"],
      required: true,
    },
    // Dynamic response data
    choices: [{ type: String }], // For Multichoice (option IDs)
    rating: { type: Number }, // For Rating
    numericValue: { type: Number }, // For Numeric
    text: { type: String }, // For Text
    ranking: [{ type: String }], // For Ranking (ordered option IDs)
  },
  { timestamps: true },
);

// Prevent duplicate responses from the same user on the same poll
PollResponseSchema.index({ poll: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("PollResponse", PollResponseSchema);
