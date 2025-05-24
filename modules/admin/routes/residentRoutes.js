
const express = require('express');
const { residentController } = require('../controllers');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { uploadMultiple } = require('../../admin/middlewares/uploadMiddleware');

const router = express.Router();
router.use(adminMiddleware);

router.post('/', uploadMultiple, residentController.createResident);
router.get('/', residentController.getAllResidents);
router.get('/:id', residentController.getResidentById);
router.put('/:id', uploadMultiple, residentController.updateResident);
router.delete('/', residentController.deleteResident);
module.exports = router;


