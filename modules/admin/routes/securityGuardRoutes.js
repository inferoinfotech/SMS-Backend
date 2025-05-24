const express = require('express');
const { securityGuardController } = require('../controllers');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(adminMiddleware);

router.post('/', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'aadharCard', maxCount: 1 }]), securityGuardController.createSecurityGuard);

router.get('/', securityGuardController.getAllSecurityGuards);

router.get('/:id', securityGuardController.getSecurityGuardById);

router.put('/:id', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'aadharCard', maxCount: 1 }]), securityGuardController.updateSecurityGuard);

router.delete('/:id', securityGuardController.deleteSecurityGuard);

module.exports = router;