const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    message: {
      type: String,
      required: function (this: any) { return !this.fileUrl; },
      trim: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileType: {
      type: String,
      enum: ["image", "pdf", "audio", null],
      default: null,
    },
    // If receiver is null, it's a Community Forum message.
    // If receiver is present, it's a Personal (1-to-1) message.
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      default: null,
    },
    tempId: {
      type: String,
      default: null
    }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chat", ChatSchema);
