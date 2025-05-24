const express = require('express');
const { alertController } = require('../controllers');
const { adminMiddleware } = require('../../admin/middlewares/authMiddleware');

const router = express.Router();

router.post('/send-alert', adminMiddleware, alertController.sendAlert);

module.exports = router;

