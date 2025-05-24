
const express = require("express");
const { summary, getInvoicesForMaintenancePending,activityParticipatorRecordsUpcoming } = require("../controllers/dashboardController");
const { residentMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/final-summary", residentMiddleware, summary); 
router.get("/final-summary-pending-maintence", residentMiddleware, getInvoicesForMaintenancePending); //Pending Maintenance
router.get("/final-summary-upcoming-activity", residentMiddleware, activityParticipatorRecordsUpcoming);


module.exports = router;


