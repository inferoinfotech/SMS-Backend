const express = require("express");

const router = express.Router();

const {
  createRequestTracking,
  editRequestTracking,
  deleteRequestTracking,
  getAllRequestTracking,
} = require("../controllers/requestTracking.controller");
const protect = require("../middleware/auth.middleware");

router.post("/create", protect, createRequestTracking);
router.put("/edit/:id", protect, editRequestTracking);
router.delete("/delete/:id", protect, deleteRequestTracking);
router.get("/get", protect, getAllRequestTracking);

module.exports = router;
