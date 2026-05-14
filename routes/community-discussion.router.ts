const express = require("express");
const router = express.Router();
const {
    createDiscussion,
    getAllDiscussions,
    getAnswers,
    createAnswer,
    toggleVoteDiscussion,
    getDiscussionById,
    toggleVoteAnswer
} = require("../controllers/community-Discussion.controller");
const protect = require("../middleware/auth.middleware");

// Get all discussions for a society
router.get("/all", protect, getAllDiscussions);

// Get a single discussion with its answers
router.get("/:id", protect, getDiscussionById);

// Create a new discussion
router.post("/create", protect, createDiscussion);

// Create an answer for a discussion
router.post("/answer/create", protect, createAnswer);

// Get answers (optional, as getDiscussionById also returns them)
router.post("/answers", protect, getAnswers);

// Toggle votes
router.post("/vote/discussion/:id", protect, toggleVoteDiscussion);
router.post("/vote/answer/:id", protect, toggleVoteAnswer);

module.exports = router;
