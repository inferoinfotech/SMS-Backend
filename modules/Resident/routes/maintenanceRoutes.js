const express = require('express');
const { residentMiddleware } = require('../middlewares/authMiddleware');
const { maintenanceController } = require('../../admin/controllers');
const { maintenancePaymentController } = require('../controllers');


const router = express.Router();
router.use(residentMiddleware);

router.get('/invoices', maintenanceController.getInvoicesforMaintenance);
router.get('/', maintenanceController.getMaintenance);
router.get('/:id', maintenanceController.getMaintenanceOne);

router.get('/invoices/:id', maintenanceController.getInvoiceById);

// Razorpay payment integration
router.post('/pay', maintenancePaymentController.initiatePayment);
router.post('/callback', maintenancePaymentController.handlePaymentCallback); 
router.post('/cash-callback', maintenancePaymentController.handleCashPayment);

module.exports = router;