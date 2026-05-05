const transporter = require("./transporter");
const logger = require("../../config/logger");

const sendOtpMail = async (email: string, otp: string) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h3>Password Reset Request</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info("OTP email sent");
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

module.exports = sendOtpMail;