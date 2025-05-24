const express = require('express');
const { pollController } = require('../controllers');
const { residentMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(residentMiddleware);

router.post('/', pollController.createPoll);

router.get('/own-polls', pollController.getOwnPolls);

router.get('/new-polls', pollController.getOtherResidentsPolls);

router.get('/previous-polls', pollController.getAllPreviousPolls);

router.post('/submit-response', pollController.submitPollResponse);

module.exports = router;