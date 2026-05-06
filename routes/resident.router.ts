const express = require("express");
const {
  createResident,
  getAllResidents,
} = require("../controllers/resident.controller");

const router = express.Router();

router.post("/create", createResident);
router.get("/get", getAllResidents);

module.exports = router;
