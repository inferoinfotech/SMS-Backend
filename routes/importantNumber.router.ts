const express = require("express");
const router = express.Router();
const {
  createImportantNumber,
  getAllImportantNumber,
  editImportantNumber,
  deleteImportantNumber,
} = require("../controllers/importantNumber.controller");
const protect = require("../middleware/auth.middleware");

router.post("/", protect, createImportantNumber);
router.get("/", protect, getAllImportantNumber);
router.put("/:id", protect, editImportantNumber);
router.delete("/:id", protect, deleteImportantNumber);

module.exports = router;