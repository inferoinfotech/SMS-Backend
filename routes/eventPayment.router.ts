const express = require("express");
const router = express.Router();
const { createEventPayment, getEventPayments } = require("../controllers/eventPayment.controller");
const protect = require("../middleware/auth.middleware");

router.post("/create", protect, createEventPayment);
router.get("/get", protect, getEventPayments);

module.exports = router;
