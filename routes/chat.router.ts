const express = require("express");
const router = express.Router();
const { getChatHistory, getPersonalChatHistory, getSocietyMembers, uploadFile } = require("../controllers/chat.controller");
const protect = require("../middleware/auth.middleware");
const chatUpload = require("../middleware/chat-upload.middleware");

router.get("/history", protect, getChatHistory);
router.get("/personal-history", protect, getPersonalChatHistory);
router.get("/members", protect, getSocietyMembers);
router.post("/upload", protect, chatUpload.single("file"), uploadFile);

module.exports = router;
