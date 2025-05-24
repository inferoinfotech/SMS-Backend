const express = require('express');
const authRoutes = require('./routes/authRoutes');
const societyRoutes = require('./routes/societyRoutes');
const importantNumbersRoutes = require('./routes/importantNumberRoutes');
const residentRoutes = require('./routes/residentRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const noteRoutes = require('./routes/noteRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const securityProtocolRoutes = require('./routes/securityProtocolRoutes');
const visitorLogRoutes = require('./routes/visitorLogRoutes');
const securityGuardRoutes = require('./routes/securityGuardRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const requestRoutes = require('./routes/requestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');

const router = express.Router()

router.use('/auth', authRoutes);
router.use('/societies', societyRoutes);
router.use('/important-numbers', importantNumbersRoutes);
router.use('/residents', residentRoutes);
router.use('/incomes', incomeRoutes);
router.use('/expenses', expenseRoutes);
router.use('/announcement', announcementRoutes);
router.use('/notes', noteRoutes);
router.use('/facilities', facilityRoutes);
router.use('/security-protocol', securityProtocolRoutes);
router.use('/visitor-log', visitorLogRoutes);
router.use('/security-guard', securityGuardRoutes);
router.use('/complaints', complaintRoutes);
router.use('/requests', requestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/maintenance', maintenanceRoutes);

module.exports = router