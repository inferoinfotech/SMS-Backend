const express = require("express");
const authRouter = express.Router();
const {
  signup,
  login,
  logout,
  getProfile,
  forgetPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/profile", protect, getProfile);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

module.exports = authRouter;
