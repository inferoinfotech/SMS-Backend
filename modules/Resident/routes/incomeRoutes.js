
const express = require('express');
const { residentMiddleware } = require('../middlewares/authMiddleware');
const { incomeController } = require('../../admin/controllers');
const { incomePaymentController } = require('../controllers');


const router = express.Router();
router.use(residentMiddleware);

router.get('/event-participator', incomeController.eventParticipatorRecords);

router.get('/', incomeController.getIncomes);
router.get('/:id', incomeController.getIncomeById);


// Razorpay payment integration
router.post('/pay', incomePaymentController.initiatePayment);
router.post('/callback', incomePaymentController.handlePaymentCallback); 

module.exports = router;