const express = require("express");
const { getAllGroups, askQuestion, answerQuestion, getGroupQuestions, createGroup } = require("../controllers/communityChatController");
const router = express.Router();

router.post("/creategroup", createGroup);
router.get("/groups", getAllGroups);
router.post("/ask-question", askQuestion);
router.post("/answer-question", answerQuestion);
router.get("/:groupId/questions", getGroupQuestions);

module.exports = router;