const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { facilityController } = require('../controllers');

const router = express.Router();

router.use(adminMiddleware);

router.post('/', facilityController.createFacility);
router.get('/', facilityController.getFacilities);
router.put('/:id', facilityController.updateFacility);
router.delete('/:id', facilityController.deleteFacility);

module.exports = router;