const residentController = require('./residentController');
const chatController = require('./chatController');
const maintenancePaymentController = require('./maintenancePaymentController');
const announcementPaymentController = require('./announcementPaymentController');
const zegoController = require('./zegoController');
const pollController = require('./pollController');
const chatMemberController = require('./getChatMemberController');
const requestSubmissionController = require('./requestsubmissionController');
const dashboardController = require('./dashboardController');
const importantNumberController = require('./importantNumberController');

module.exports = {
    residentController,
    chatController,
    maintenancePaymentController,
    announcementPaymentController,
    zegoController,
    pollController,
    chatMemberController,
    requestSubmissionController,
    dashboardController,
    importantNumberController
};