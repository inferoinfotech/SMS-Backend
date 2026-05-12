const express = require("express");
const router = express.Router();
const {
  createImportantNumber,
  getAllImportantNumber,
  editImportantNumber,
  deleteImportantNumber,
} = require("../controllers/importantNumber.controller");
const protect = require("../middleware/auth.middleware");

// POST  /api/important-number/
// GET  /api/important-number/
// PUT  /api/important-number/:id
// DELETE  /api/important-number/:id
router.post("/", protect, createImportantNumber);
router.get("/", protect, getAllImportantNumber);
router.put("/:id", protect, editImportantNumber);
router.delete("/:id", protect, deleteImportantNumber);

module.exports = router;