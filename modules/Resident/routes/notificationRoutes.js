const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.put('/status', notificationController.updateNotificationStatus);
router.put('/read/:notificationId', notificationController.markAsRead);

module.exports = router;