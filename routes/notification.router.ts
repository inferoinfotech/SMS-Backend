const express = require("express");
const { getNotifications, markAsRead, clearAll } = require("../controllers/notification.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id", protect, markAsRead);
router.delete("/", protect, clearAll);

module.exports = router;
