const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { announcementController } = require('../controllers');
const router = express.Router();

router.use(adminMiddleware);

router.get('/event-participator', announcementController.eventParticipatorRecords);
router.get('/activity-participator', announcementController.activityParticipatorRecords);

router.post('/', announcementController.addAnnouncement);
router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.put('/:id', announcementController.updateAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

// Cash payment approval route
router.post('/approve-cash-payment', announcementController.approveCashPayment);
router.post('/update-status', announcementController.updateAnnouncementStatus);

module.exports = router;