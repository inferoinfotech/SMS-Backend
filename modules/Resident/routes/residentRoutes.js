const express = require('express');
const { residentController } = require('../controllers');
const router = express.Router();

router.post('/login', residentController.login);
router.get('/:id', residentController.getResidentById); 

module.exports = router;
