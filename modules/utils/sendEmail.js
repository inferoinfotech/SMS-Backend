
const nodemailer = require('nodemailer');

const sendOtpViaEmail = async (email, otp, otpExpires) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is ${otp}. It will expire in 1 minutes.`,
  };

  await transporter.sendMail(message);
};


const sendAlertEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: subject,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Alert sent to ${email}`);
  } catch (error) {
    console.error(`Error sending email to ${email}:`, error);
    throw error;
  }
};

module.exports = { sendOtpViaEmail, sendAlertEmail };
