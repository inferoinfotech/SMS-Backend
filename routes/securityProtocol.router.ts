const express = require("express");
const router = express.Router();
const { createSecurityProtocol, editSecurityProtocol, deleteSecurityProtocol, getAllSecurityProtocol } = require("../controllers/securityProtocol.controller");
const protect = require("../middleware/auth.middleware");
router.post("/create",protect, createSecurityProtocol);
router.put("/edit/:id",protect, editSecurityProtocol);
router.delete("/delete/:id",protect, deleteSecurityProtocol);
router.get("/get",protect, getAllSecurityProtocol);
module.exports = router;