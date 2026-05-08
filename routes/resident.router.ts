const express = require("express");
const {
  createResident,
  getAllResidents,
} = require("../controllers/resident.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create", protect, createResident);
router.get("/get", protect, getAllResidents);

module.exports = router;
