const express = require('express');
const { residentMiddleware } = require("../middlewares/authMiddleware");
const { facilityController } = require('../../admin/controllers');

const router = express.Router();

router.use(residentMiddleware);

router.get('/', facilityController.getFacilities);

module.exports = router;