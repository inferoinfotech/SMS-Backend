const express = require('express');
const router = express.Router();
const {zegoController} = require('../controllers');

// POST request to generate ZEGOCLOUD token
router.post('/getToken', zegoController.generateZegoToken);

module.exports = router;