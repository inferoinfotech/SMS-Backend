const express = require("express");
const {setupPassword} = require("../controllers/setupPassword.controller");
const router = express.Router();
const {
  createSecurityGuard,
  editSecurityGuard,
  deleteSecurityGuard,
  getAllSecurityGuard,
} = require("../controllers/securityGuard.controller");
const protect = require("../middleware/auth.middleware");

router.post("/create", protect, createSecurityGuard);
router.put("/edit/:id", protect, editSecurityGuard);
router.delete("/delete/:id", protect, deleteSecurityGuard);
router.get("/get", protect, getAllSecurityGuard);
router.post("/setup-password/:token", setupPassword);

module.exports = router;
