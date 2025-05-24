const express = require('express');
const { visitorLogController } = require('../controllers');
const { adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(adminMiddleware);

router.get('/', visitorLogController.getAllVisitorLogs);

module.exports = router;