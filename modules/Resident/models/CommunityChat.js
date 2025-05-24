const mongoose = require("mongoose");

const groupChatSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      askedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Resident" },
      createdAt: { type: Date, default: Date.now },
      answers: [
        {
          answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Resident" },
          answerText: { type: String },
          createdAt: { type: Date, default: Date.now }
        }
      ]
    }
  ]
});

const GroupChat = mongoose.model("GroupChat", groupChatSchema);

module.exports = GroupChat;
