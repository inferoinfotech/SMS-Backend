const express = require('express');
const {uploadSingle} = require('../middlewares/uploadMiddleware');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { authController } = require('../controllers');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/getAdminProfile', adminMiddleware, authController.getAdminProfile);
router.put('/updateAdminProfile', adminMiddleware, uploadSingle('profileImage'), authController.updateAdminProfile);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/resetPassword', authController.resetPassword);

// password check
router.post('/checkPassword', adminMiddleware, authController.checkPassword);

module.exports = router;
