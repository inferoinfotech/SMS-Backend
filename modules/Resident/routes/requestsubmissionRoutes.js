const express = require('express');
const { residentMiddleware } = require('../middlewares/authMiddleware');
const { requestController } = require('../../admin/controllers');
const { requestSubmissionController } = require('../controllers');

const router = express.Router();

router.use(residentMiddleware);

router.post('/', requestController.createRequest);
router.get('/', requestSubmissionController.getRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;