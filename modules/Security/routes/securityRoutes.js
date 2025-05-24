const express = require('express');
const { securityController } = require('../controllers');
const router = express.Router();

router.post('/login', securityController.login); 
router.get('/:id', securityController.getSecurityGuardById);
router.get('/', securityController.getAllSecurityGuards);

module.exports = router;
