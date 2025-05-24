const { Admin, Resident, SecurityGuard } = require('../../admin/models');  

const { Alert } = require('../models');
const { sendAlertEmail } = require('../../utils/sendEmail');
const { sendAlertSms } = require('../../utils/sendSms');

exports.sendAlert = async (req, res) => {
  const { alertType, description } = req.body;

  if (!alertType || !description) {
    return res.status(400).json({ message: 'Alert type and description are required.' });
  }

  try {
    const societyId = req.admin.society?._id;

    if (!societyId) {
      return res.status(400).json({ message: 'Society not found for the admin.' });
    }

    const adminMembers = await Admin.find({ society: societyId });
    const residentMembers = await Resident.find({ society: societyId });
    const securityGuards = await SecurityGuard.find({ society: societyId });

    const members = [...adminMembers, ...residentMembers, ...securityGuards];

    if (members.length === 0) {
      return res.status(404).json({ message: 'No members found in this society.' });
    }

    const newAlert = new Alert({
      alertType,
      description,
      society: societyId,
    });
    await newAlert.save();

    const emailPromises = [];
    const smsPromises = [];

    for (const member of members) {
      if (member.email) {
        emailPromises.push(
          sendAlertEmail(
            member.email,
            `Emergency Alert: ${alertType}`,
            description
          ).catch((err) => {
            console.error(`Failed to send email to ${member.email}:`, err);
            return { status: 'failed', email: member.email, error: err.message };
          })
        );
      }
      if (member.phone) {
        smsPromises.push(
          sendAlertSms(
            member.phone,
            `Emergency Alert: ${alertType} - ${description}`
          ).catch((err) => {
            console.error(`Failed to send SMS to ${member.phone}:`, err);
            return { status: 'failed', phone: member.phone, error: err.message };
          })
        );
      }
    }

    const emailResults = await Promise.allSettled(emailPromises);
    const smsResults = await Promise.allSettled(smsPromises);

    const failedEmails = emailResults.filter((result) => result.status === 'rejected');
    const failedSms = smsResults.filter((result) => result.status === 'rejected');

    if (failedEmails.length || failedSms.length) {
      return res.status(207).json({
        message: 'Alerts sent with some errors.',
        failedEmails,
        failedSms,
      });
    }

    res.status(200).json({ message: 'Alerts sent to all society members successfully.' });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({ message: 'Failed to send alerts. Please try again later.' });
  }
};
