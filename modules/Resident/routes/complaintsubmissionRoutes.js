const express = require("express");
const { residentMiddleware } = require("../middlewares/authMiddleware");
const { complaintController } = require("../../admin/controllers");

const router = express.Router();

router.use(residentMiddleware);

router.post('/', complaintController.createComplaint);
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaintById);
router.put('/:id', complaintController.updateComplaint);
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
