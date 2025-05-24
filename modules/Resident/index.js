const express = require('express');
const residentRoutes = require('./routes/residentRoutes');
const complaintsubmissionRoutes = require('./routes/complaintsubmissionRoutes');
const requestsubmissionRoutes = require('./routes/requestsubmissionRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const securityProtocolRoutes = require('./routes/securityProtocolRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const zegoRoutes = require('./routes/zegoRoutes');
const pollRoutes = require('./routes/pollRoutes');
const chatRoutes = require('./routes/chatRoutes');
const communityChat = require('./routes/communityChatRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const importantNumbersRoutes = require('./routes/importantNumberRoutes');


const router = express.Router()

router.use('/auth', residentRoutes);
router.use('/complaint-submission', complaintsubmissionRoutes);
router.use('/request-submission', requestsubmissionRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/announcement', announcementRoutes);
router.use('/security-protocol', securityProtocolRoutes);
router.use('/facilities', facilityRoutes);
router.use('/zego', zegoRoutes);
router.use('/community-polls', pollRoutes);
router.use('/chat',chatRoutes);
router.use('/community-chat',communityChat);
router.use('/dashboard',dashboardRoutes);
router.use('/important-numbers',importantNumbersRoutes);

module.exports = router