const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { expenseController } = require('../controllers');
const {upload} = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.use(adminMiddleware);

router.post('/', upload.single('bill'), expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', upload.single('bill'), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;