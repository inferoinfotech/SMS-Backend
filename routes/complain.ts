const express = require("express");
const {
  createComplain,
  editComplain,
  deleteComplain,
  getAllComplain,
} = require("../controllers/complain.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/createComplain", protect, createComplain);
router.put("/editComplain/:id", protect, editComplain);
router.delete("/deleteComplain/:id", protect, deleteComplain);
router.get("/getAllComplain", protect, getAllComplain);

module.exports = router;
