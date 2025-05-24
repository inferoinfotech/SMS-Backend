const express = require('express');
const { visitorLogController } = require('../controllers');
const { securityMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(securityMiddleware);

router.post('/', (req, res, next) => {
    req.society = req.security.society;
    next();
}, visitorLogController.createVisitorLog);

router.get('/', visitorLogController.getAllVisitorLogs);

module.exports = router;