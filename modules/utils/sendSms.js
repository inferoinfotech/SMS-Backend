const dotenv = require('dotenv');
dotenv.config(); 

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtpViaSms = async (phone, otp) => {
  await client.messages.create({
    body: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
};

const sendAlertSms = async (phone, message) => {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
};

module.exports = sendAlertSms;


module.exports = sendOtpViaSms;

module.exports = { sendOtpViaSms, sendAlertSms };


