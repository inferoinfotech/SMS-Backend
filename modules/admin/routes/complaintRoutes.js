const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { complaintController } = require('../controllers');

const router = express.Router();
router.use(adminMiddleware);

router.post('/', complaintController.createComplaint);
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaintById);
router.put('/:id', complaintController.updateComplaint);
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;
