const express = require("express");
const {setupPassword} = require("../controllers/setupPassword.controller");
const router = express.Router();
const {
  createSecurityGuard,
  editSecurityGuard,
  deleteSecurityGuard,
  getAllSecurityGuard,
} = require("../controllers/securityGuard.controller");
const upload = require("../middleware/multer.middleware");
const protect = require("../middleware/auth.middleware");

router.post("/create", protect, upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "uploadAadhar", maxCount: 1 }]), createSecurityGuard);
router.put("/edit/:id", protect, upload.fields([{ name: "profileImage", maxCount: 1 }, { name: "uploadAadhar", maxCount: 1 }]), editSecurityGuard);
router.delete("/delete/:id", protect, deleteSecurityGuard);
router.get("/get", protect, getAllSecurityGuard);
router.post("/setup-password/:token", setupPassword);

module.exports = router;
