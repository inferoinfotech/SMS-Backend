// routes/payment.routes.ts

const express = require("express");
const protect = require("../middleware/auth.middleware");
const { createOrder, verifyPayment } = require("../controllers/payment.controller");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
module.exports = router;