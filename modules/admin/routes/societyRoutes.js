const express = require('express');
const { societyController } = require('../controllers');
const router = express.Router();

router.post('/', societyController.createSociety);
router.get('/', societyController.getSocieties);
router.get('/:id', societyController.getSocietyById);

module.exports = router;