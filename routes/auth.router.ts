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
  editProfile
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  signupSchema,
  loginSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  editProfileSchema
} = require("../schemas/auth.schema");
const upload = require("../middleware/multer.middleware");

authRouter.post("/signup", validate(signupSchema), signup);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.get("/profile", protect, getProfile);
authRouter.post("/forget-password", validate(forgetPasswordSchema), forgetPassword);
authRouter.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
authRouter.post("/reset-password", validate(resetPasswordSchema), resetPassword);
authRouter.put("/edit-profile/:id", protect, upload.single("profileImage"), validate(editProfileSchema), editProfile);

module.exports = authRouter;
