const fs = require('fs');
const path = require('path');
const { sendOtpViaEmail } = require('../../utils/sendEmail');
const { sendOtpViaSms } = require('../../utils/sendSms');
const { Admin, Society } = require('../models');
const { registerSchema, updateAdminSchema, loginSchema, emailPhoneSchema, otpSchema, resetPasswordSchema, checkPasswordSchema } = require('../joi');

exports.getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { error } = updateAdminSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    const { firstName, lastName, email,  country, state, city } = req.body;
    const updateData = { firstName, lastName, email, country, state, city };

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    if (req.file) {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      if (admin.profileImage) {
        fs.unlink(path.join(__dirname, '..', '..', 'uploads', admin.profileImage), (err) => {
          if (err) console.error('Failed to delete old profile image:', err);
        });
      }
      updateData.profileImage = req.file.filename;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(req.admin.id, updateData, { new: true });
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedAdmin });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { firstName, lastName, email, phoneNumber, country, state, city, society, password } = req.body;

  try {

    // Check if society exists
    const societyExist = await Society.findById(society);
    if (!societyExist) {
      return res.status(404).json({ success: false, message: 'Society not found' });
    }

    // Create admin
    const admin = await Admin.create({ firstName, lastName, email, phoneNumber, country, state, city, society, password });
    return res.status(201).json({ success: true, data: admin });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to Register!' });
  }
};

exports.login = async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    sendTokenResponse(admin, 200, res);


  } catch (error) {
    next(error);
  }
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.forgotPassword = async (req, res, next) => {
  const { error } = emailPhoneSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { email, phoneNumber } = req.body;

  try {
    const admin = await Admin.findOne({ $or: [{ email }, { phoneNumber }] });
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const otp = generateOtp();
    admin.otp = otp;
    admin.otpExpires = Date.now() + 1 * 60 * 1000;

    await admin.save();

    if (email) await sendOtpViaEmail(admin.email, otp, admin.otpExpires);
    if (phoneNumber) await sendOtpViaSms(admin.phoneNumber, otp);
    console.log('OTP sent successfully', otp);
    res.status(200).json({ success: true, message: 'OTP sent to email or phone' });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  const { error } = otpSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { otp } = req.body;

  try {
    const admin = await Admin.findOne({ otp, otpExpires: { $gt: Date.now() } });
    if (!admin) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    res.status(200).json({ success: true, message: 'OTP verified successfully. You may now reset your password.' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
      return res.status(400).json({ message: 'Validation error', details: error.details });
  }

  const { email, newPassword } = req.body;

  try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
          return res.status(404).json({ message: 'Admin not found' });
      }

      admin.password = newPassword;
      admin.otp = undefined;
      admin.otpExpires = undefined;

      await admin.save();

      res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.checkPassword = async (req, res, next) => {
  const { error } = checkPasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  const { password } = req.body;

  try {
    const admin = await Admin.findOne({ email: req.admin.email }).select('+password');
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    return res.status(200).json({ success: true, message: "password matched" })
  } catch (error) {
    next(error);
  }
}


const sendTokenResponse = (admin, statusCode, res) => {
  if (!admin || typeof admin.getSignedJwtToken !== 'function') {
    return res.status(500).json({ success: false, message: 'Admin not found or token generation error' });
  }


  try {
    const token = admin.getSignedJwtToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      // secure: process.env.NODE_ENV === 'production',
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'None'
      // sameSite: 'Strict'
    });

    res.status(statusCode).json({
      success: true,
      message: 'Logged in successfully',
      token,
      adminId: admin._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

