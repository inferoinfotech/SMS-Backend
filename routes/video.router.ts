const express = require("express");
const router = express.Router();
const { generateToken } = require("../controllers/video.controller");
const protect = require("../middleware/auth.middleware");

router.post("/generate-token", protect, generateToken);

module.exports = router;
