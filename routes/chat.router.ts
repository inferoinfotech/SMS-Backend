const express = require("express");
const router = express.Router();
const { getChatHistory, getPersonalChatHistory, getSocietyMembers } = require("../controllers/chat.controller");
const protect = require("../middleware/auth.middleware");

router.get("/history", protect, getChatHistory);
router.get("/personal-history", protect, getPersonalChatHistory);
router.get("/members", protect, getSocietyMembers);

module.exports = router;
