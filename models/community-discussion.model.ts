const mongoose = require("mongoose");

// 1. THE DISCUSSION (QUESTION) SCHEMA
const communityDiscussionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    description: { type: String, required: true },
    // Use an array of User IDs to track who voted (prevents double voting)
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auth" }],
    views: { type: Number, default: 0 },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auth" }],
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  },
  { timestamps: true },
);

// 2. THE ANSWER SCHEMA
const discussionAnswerSchema = new mongoose.Schema(
  {
    discussionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityDiscussion",
      required: true,
    },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Auth" }],
  },
  { timestamps: true },
);

const CommunityDiscussion = mongoose.model(
  "CommunityDiscussion",
  communityDiscussionSchema,
);
const DiscussionAnswer = mongoose.model(
  "DiscussionAnswer",
  discussionAnswerSchema,
);

module.exports = { CommunityDiscussion, DiscussionAnswer };
