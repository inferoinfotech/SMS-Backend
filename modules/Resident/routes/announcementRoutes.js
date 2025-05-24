const express = require('express');
const { residentMiddleware } = require('../middlewares/authMiddleware');
const { announcementController } = require('../../admin/controllers');
const { announcementPaymentController } = require('../controllers');


const router = express.Router();
router.use(residentMiddleware);

router.get('/event-participator', announcementController.eventParticipatorRecords);
router.get('/activity-participator', announcementController.activityParticipatorRecords);
router.get('/', announcementPaymentController.getAllAnnouncements);
router.get('/get-single-user', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);


// Announcements-related routes (Invoices)
router.get('/invoices', announcementController.getInvoicesforAnnouncement);
router.get('/invoices/:id', announcementController.getInvoiceById);

// Razorpay payment integration
router.post('/pay', announcementPaymentController.initiatePayment);
router.post('/callback', announcementPaymentController.handlePaymentCallback); 
router.post('/cash-callback', announcementPaymentController.handleCashPayment); 

module.exports = router;