const express = require("express");
const router = express.Router();
const { createPoll, getPoll, pollAnswer, getResults, updateStatus, deletePoll } = require("../controllers/poll.controller");
const protect = require("../middleware/auth.middleware");

router.post("/create", protect, createPoll);
router.get("/get", protect, getPoll);
router.post("/answer", protect, pollAnswer);
router.get("/results/:pollId", protect, getResults);
router.patch("/status/:pollId", protect, updateStatus);
router.delete("/:pollId", protect, deletePoll);

module.exports = router;