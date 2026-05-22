const Auth = require("../models/auth.model");
const Society = require("../models/society.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../config/logger");
const sendOtpMail = require("../utils/nodemailer/sendOtpMail");
const fs = require("fs");
const path = require("path");

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
    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `${error} + Internal server error` });
  }
};

const login = async (req: any, res: any) => {
  console.log("req.body", req.body);
  try {
    const { email, phoneNumber, password, rememberMe = false } = req.body;
    console.log("email, phoneNumber, password", email, phoneNumber, password);
    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        message: "Email or phone number and password are required",
      });
    }

    let user = await Auth.findOne({
      $or: [
        email ? { email } : null,
        phoneNumber ? { phoneNumber } : null,
      ].filter(Boolean),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message:
          "Password not set. Please check your email for the setup link.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const tokenMaxAge = rememberMe
      ? 1000 * 60 * 60 * 24 * 30
      : 1000 * 60 * 60 * 24;
    const token = jwt.sign(
      { id: user._id, role: user.role, society: user.society },
      process.env.JWT_SECRET,
      {
        expiresIn: rememberMe ? "30d" : "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Always true for cross-site work between Vercel and Render
      maxAge: tokenMaxAge,
      sameSite: "none", // Required for cross-site credentials
    });
    res
      .status(200)
      .json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: `${error} + Internal server error` });
  }
};

const logout = async (req: any, res: any) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
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

    console.log(otp, "otp");

    // Send OTP via email
    await sendOtpMail(user.email, otp);

    res.status(200).json({
      message: "OTP sent successfully to your registered email",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" + error });
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
    let user;
    const { role, id } = req.user;

    if (role === "admin") {
      user = await Auth.findById(id).select(
        "-password -confirmPassword -resetOtp -otpExpires -__v",
      );

      if (user && user.selectSociety && user.selectSociety.length > 0) {
        // Fetch full society details including IDs
        const societies = await Society.find({
          societyName: { $in: user.selectSociety },
        });

        // We convert to JSON and add the societies array
        const userObj = user.toObject();
        userObj.societies = societies;

        return res.status(200).json({
          message: "User profile fetched successfully",
          user: userObj,
        });
      }
    } else if (role === "guard") {
      user = await Auth.findById(id).select("-password -__v");
    } else if (role === "resident") {
      user = await Auth.findById(id).select("-password -__v");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editProfile = async (req: any, res: any) => {
  try {
    const { role } = req.user;
    let user;

    if (role === "admin") {
      user = await Auth.findById(req.params.id);
    } else if (role === "guard") {
      user = await Auth.findById(req.params.id);
    } else if (role === "resident") {
      user = await Auth.findById(req.params.id);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update common fields
    if (req.body.firstname !== undefined) user.firstname = req.body.firstname;
    if (req.body.lastname !== undefined) user.lastname = req.body.lastname;
    if (req.body.name !== undefined) user.name = req.body.name; // Resident uses 'name'
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.phoneNumber !== undefined)
      user.phoneNumber = req.body.phoneNumber;

    // Admin specific fields
    if (role === "admin") {
      if (req.body.country !== undefined) user.country = req.body.country;
      if (req.body.city !== undefined) user.city = req.body.city;
      if (req.body.state !== undefined) user.state = req.body.state;
      if (req.body.selectSociety !== undefined)
        user.selectSociety = req.body.selectSociety;
    }

    // Handle profile image update
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    } else if (req.file) {
      // Use req.file.path for Cloudinary or fallback to local path
      user.profileImage = req.file.path || `uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Edit profile error:", error);
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
  editProfile,
};
