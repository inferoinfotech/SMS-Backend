
const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { maintenanceController } = require('../controllers');

const router = express.Router();
router.use(adminMiddleware);

router.post('/', maintenanceController.createMaintenance);
router.get('/', maintenanceController.getMaintenance);
router.get('/:id', maintenanceController.getMaintenanceOne);
router.put('/update-status-paymentType', maintenanceController.updateMaintenanceStatus);
router.post('/approve-cash-payment', maintenanceController.approveCashPayment);
router.post('/update-status', maintenanceController.updateMaintenanceStatusDone);

module.exports = router;


