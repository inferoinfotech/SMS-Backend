const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const {incomeController, announcementController} = require('../controllers');
const router = express.Router();

router.use(adminMiddleware);

router.post('/', incomeController.addIncome);
router.get('/', incomeController.getIncomes);
router.get('/:id', incomeController.getIncomeById);
router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);
router.get('/event-participator', announcementController.eventParticipatorRecords);
router.get('/activity-participator', announcementController.activityParticipatorRecords);
module.exports = router;