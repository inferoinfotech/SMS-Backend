
const express = require("express");
const { summary, getInvoicesForMaintenancePending,activityParticipatorRecordsUpcoming, getDailyActivityData } = require("../controllers/dashboardController");
const { adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/final-summary", adminMiddleware, summary);
router.get('/daily-activity', adminMiddleware, getDailyActivityData);   
router.get("/final-summary-pending-maintence", adminMiddleware, getInvoicesForMaintenancePending);
router.get("/final-summary-upcoming-activity", adminMiddleware, activityParticipatorRecordsUpcoming);


module.exports = router;


