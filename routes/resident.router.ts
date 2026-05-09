const express = require("express");
const {
  createResident,
  getAllResidents,
  createPassword,
  editResident,
} = require("../controllers/resident.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create", protect, createResident);
router.get("/get", protect, getAllResidents);
router.post("/create-password/:token", createPassword);
router.put("/edit/:id", protect, editResident);

module.exports = router;
