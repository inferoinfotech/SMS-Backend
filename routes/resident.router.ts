const express = require("express");
const {
  createResident,
  getAllResidents,
  createPassword,
  editResident,
  editStatusResident,
} = require("../controllers/resident.controller");
const protect = require("../middleware/auth.middleware");

const upload = require("../middleware/multer.middleware");

const router = express.Router();

router.post(
  "/create",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "uploadAadharfront", maxCount: 1 },
    { name: "uploadAadharback", maxCount: 1 },
    { name: "uploadPan", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "rentAgreeMent", maxCount: 1 },
  ]),
  createResident,
);
router.get("/get", protect, getAllResidents);
router.post("/create-password/:token", createPassword);
router.put(
  "/edit/:id",
  protect,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "uploadAadharfront", maxCount: 1 },
    { name: "uploadAadharback", maxCount: 1 },
    { name: "uploadPan", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "rentAgreeMent", maxCount: 1 },
  ]),
  editResident,
);
router.put("/update-status/:id", protect, editStatusResident);

module.exports = router;
