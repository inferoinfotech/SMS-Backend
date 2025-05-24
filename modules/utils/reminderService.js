const cron = require("node-cron");
const moment = require("moment-timezone");
const Facility = require("../models/Facility");
const sendNotification = require("./notifications");

const scheduleReminders = () => {
  cron.schedule("0 1 * * *", async () => {
    const today = moment().tz('Asia/Kolkata');

    const facilities = await Facility.find();

    facilities.forEach(facility => {
      const remindBeforeDate = moment(facility.serviceDate)
        .subtract(facility.remindBeforeDate, 'days')
        .tz('Asia/Kolkata');

      // If today is the same as the remindBeforeDate
      if (today.isSame(remindBeforeDate, 'day')) {
        // Send reminder notification
        sendNotification(`Reminder: ${facility.name} is scheduled for service on ${facility.serviceDate}`);
      }
    });
  });
};



module.exports = scheduleReminders;