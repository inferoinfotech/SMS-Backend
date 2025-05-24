const express = require('express');
const securityRoutes = require('./routes/securityRoutes');
const visitorLogRoutes = require('./routes/visitorLogRoutes');
const alertRoutes = require('./routes/alertRoutes');
const router = express.Router()

router.use('/auth', securityRoutes);
router.use('/visitor-log', visitorLogRoutes);
router.use('/emergency-alert', alertRoutes);


module.exports = router