const express = require("express");
const router = express.Router();
const { createEmergency, getEmergency, deleteEmergency } = require("../controllers/emergency.controller");
const protect = require("../middleware/auth.middleware");

// POST /api/emergency
// GET /api/emergency
// DELETE /api/emergency/:id

router.post("/", protect, createEmergency);
router.get("/", protect, getEmergency);
router.delete("/:id", protect, deleteEmergency);

module.exports = router;