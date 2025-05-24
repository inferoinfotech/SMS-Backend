const express = require('express');
const { securityProtocolController } = require('../controllers');
const { adminMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(adminMiddleware);

router.post('/', securityProtocolController.createProtocol);
router.get('/', securityProtocolController.getAllProtocols);
router.get('/:id', securityProtocolController.getProtocolById);
router.put('/:id', securityProtocolController.updateProtocol);
router.delete('/:id', securityProtocolController.deleteProtocol);

module.exports = router;