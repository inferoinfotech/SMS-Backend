const express = require("express");
const router = express.Router();
const { createPoll, getPoll, pollAnswer } = require("../controllers/poll.controller");
const protect = require("../middleware/auth.middleware");

router.post("/create", protect, createPoll);
router.get("/get", protect, getPoll);
router.post("/answer", protect, pollAnswer);

module.exports = router;