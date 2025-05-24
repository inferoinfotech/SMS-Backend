const express = require('express');
const { residentMiddleware } = require("../middlewares/authMiddleware");
const { importantNumberController } = require('../controllers');

const router = express.Router();
router.use(residentMiddleware);
router.get('/',  importantNumberController.getImportantNumbers);

module.exports = router;