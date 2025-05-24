const express = require('express');
const { adminMiddleware } = require('../middlewares/authMiddleware');
const { requestController } = require('../controllers');

const router = express.Router();
router.use(adminMiddleware);

router.post('/', requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
