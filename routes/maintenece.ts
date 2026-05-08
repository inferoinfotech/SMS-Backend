const express = require("express");
const router = express.Router();

const {
    maintenance,
    maintenanceSetup,
    getMaintenance
} = require("../controllers/maintenece.controller");
const protect = require("../middleware/auth.middleware");
router.post("/maintenance-setup",protect,maintenanceSetup)
router.post("/",protect,maintenance)
router.get("/", protect, getMaintenance);

module.exports = router;