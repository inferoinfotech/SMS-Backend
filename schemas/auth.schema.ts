const { z } = require("zod");

const signupSchema = z
  .object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    selectSociety: z.string().min(1, "Society selection is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
    privacyPolicy: z
      .boolean()
      .refine((val: any) => val === true, "Privacy policy must be accepted"),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data: any) => data.email || data.phoneNumber, {
    message: "Email or phone number is required",
    path: ["email", "phoneNumber"],
  });

const forgetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
  })
  .refine((data: any) => data.email || data.phoneNumber, {
    message: "Email or phone number is required",
    path: ["email", "phoneNumber"],
  });

const verifyOtpSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    otp: z.string().length(6, "OTP must be 6 digits"),
  })
  .refine((data: any) => data.email || data.phoneNumber, {
    message: "Email or phone number is required",
    path: ["email", "phoneNumber"],
  });

const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    otp: z.string().length(6, "OTP must be 6 digits"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data: any) => data.email || data.phoneNumber, {
    message: "Email or phone number is required",
    path: ["email", "phoneNumber"],
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const editProfileSchema = z.object({
  firstname: z.string().min(1, "First name is required").optional(),
  lastname: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
  country: z.string().min(1, "Country is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  selectSociety: z.string().min(1, "Society selection is required").optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  editProfileSchema,
};
