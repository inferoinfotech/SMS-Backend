const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { noteController } = require('../controllers');

const router = express.Router();

router.use(adminMiddleware);

router.post('/', noteController.createNote);
router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNoteById);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
