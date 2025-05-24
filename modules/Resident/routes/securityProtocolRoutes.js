const express = require('express');
const { securityProtocolController } = require('../../admin/controllers');
const { residentMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(residentMiddleware);

router.get('/', securityProtocolController.getAllProtocols);
module.exports = router;