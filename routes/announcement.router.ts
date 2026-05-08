const express = require("express");
const router = express.Router();
const { createAnnouncement, editAnnouncement, deleteAnnouncement, getAllAnnouncement } = require("../controllers/announcement.controller");
const protect = require("../middleware/auth.middleware");
router.post("/create",protect, createAnnouncement);
router.put("/edit/:id",protect, editAnnouncement);
router.delete("/delete/:id",protect, deleteAnnouncement);
router.get("/get",protect, getAllAnnouncement);
module.exports = router;