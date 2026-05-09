const express = require("express");
const router = express.Router();

const {
    createMaintenance,
    maintenanceSetup,
    getMaintenance,
    verifyPassword
} = require("../controllers/maintenece.controller");
const protect = require("../middleware/auth.middleware");

router.post("/verify-password",protect,verifyPassword)
router.post("/maintenance-setup",protect,maintenanceSetup)
router.post("/",protect,createMaintenance)
router.get("/", protect, getMaintenance);

module.exports = router;