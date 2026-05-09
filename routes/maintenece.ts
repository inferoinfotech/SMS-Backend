const express = require("express");
const router = express.Router();

const {
    createMaintenance,
    maintenanceSetup,
    getMaintenance
} = require("../controllers/maintenece.controller");
const protect = require("../middleware/auth.middleware");
router.post("/maintenance-setup",protect,maintenanceSetup)
router.post("/",protect,createMaintenance)
router.get("/", protect, getMaintenance);

module.exports = router;