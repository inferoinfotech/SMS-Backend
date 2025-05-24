const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { importantNumberController } = require('../controllers');

const router = express.Router();
router.use(adminMiddleware);
router.post('/', importantNumberController.createImportantNumber);  
router.get('/',  importantNumberController.getImportantNumbers);
router.put('/:id',  importantNumberController.updateImportantNumber);
router.delete('/:id', importantNumberController.deleteImportantNumber);

module.exports = router;