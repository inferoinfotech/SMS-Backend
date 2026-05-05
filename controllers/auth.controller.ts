const Auth = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const sendOtpMail = require("../utils/nodemailer/sendOtpMail");

const signup = async (req: any, res: any) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      country,
      city,
      state,
      selectSociety,
      password,
      confirmPassword,
      privacyPolicy,
    } = req.body;

    if (
      !firstname ||
      !lastname ||
      !email ||
      !phoneNumber ||
      !country ||
      !city ||
      !state ||
      !selectSociety ||
      !password ||
      !confirmPassword ||
      !privacyPolicy
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await Auth.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Auth({
      firstname,
      lastname,
      email,
      phoneNumber,
      country,
      city,
      state,
      selectSociety,
      password: hashedPassword,
      confirmPassword: hashedPassword,
      privacyPolicy,
    });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error} + Internal server error` });
  }
};

const login = async (req: any, res: any) => {
  console.log("req.body", req.body);
  try {
    const { email, phoneNumber, password } = req.body;
    console.log("email, phoneNumber, password", email, phoneNumber, password);
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        message: "Email or phone number and password are required",
      });
    }
    const user = await Auth.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 1000 * 60 * 60,
      sameSite: "strict",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error} + Internal server error` });
  }
};

const logout = async (req: any, res: any) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const forgetPassword = async (req: any, res: any) => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: "Email or phone number is required",
      });
    }

    const user = await Auth.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // TODO: send OTP via email/SMS
    await sendOtpMail(email, otp);
    res.status(200).json({
      message: "OTP sent successfully"
     
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const verifyOtp = async (req: any, res: any) => {
  try {
    const { email, phoneNumber, otp } = req.body;

    if ((!email && !phoneNumber) || !otp) {
      return res.status(400).json({
        message: "Email/Phone and OTP required",
      });
    }

    const user = await Auth.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const resetPassword = async (req: any, res: any) => {
  try {
    const { email, phoneNumber, otp, password, confirmPassword } = req.body;

    if ((!email && !phoneNumber) || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const user = await Auth.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify OTP again to ensure security
    if (user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword; // Update confirmPassword as it is required in model

    // clear OTP data
    user.resetOtp = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProfile = async (req: any, res: any) => {
  try {
    const user = await Auth.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signup,
  login,
  logout,
  forgetPassword,
  resetPassword,
  getProfile,
  verifyOtp,
};
