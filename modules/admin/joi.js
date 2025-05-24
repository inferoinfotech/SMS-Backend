const Joi = require('joi');

exports.registerSchema = Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(30)
      .required(),
    lastName: Joi.string()
      .min(2)
      .max(30)
      .required(),
    email: Joi.string()
      .email()
      .required(),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]+$/) // Ensures phone contains only numbers
      .min(7)
      .max(15)
      .required(),
    country: Joi.string()
      .min(2)
      .max(50)
      .required(),
    state: Joi.string()
      .min(2)
      .max(50)
      .required(),
    city: Joi.string()
      .min(2)
      .max(50)
      .required(),
    society: Joi.string()
      .min(2)
      .max(50)
      .optional(),
    password: Joi.string()
      .min(6) // Minimum 6 characters for password
      .max(128)
      .required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password')) // Ensures passwords match
      .required()
      .messages({ 'any.only': 'Passwords do not match' }), // Custom error message for mismatch
    //   deviceToken: Joi.string()
    //   .optional() // Make deviceToken optional
  }).options({ abortEarly: false });

exports.updateAdminSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(30)
        .optional(),
    lastName: Joi.string()
        .min(2)
        .max(30)
        .optional(),
    email: Joi.string()
        .email()
        .optional(),
    phoneNumber: Joi.string()
        .pattern(/^[0-9]+$/) // Ensures phone contains only numbers
        .min(7)
        .max(15)
        .optional(),
    country: Joi.string()
        .min(2)
        .max(50)
        .optional(),
    state: Joi.string()
        .min(2)
        .max(50)
        .optional(),
    city: Joi.string()
        .min(2)
        .max(50)
        .optional(),
    society: Joi.string()
        .min(2)
        .max(50)
        .optional(),
    password: Joi.string()
        .min(6) // Minimum 6 characters for password
        .max(128)
        .optional(),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password')) // Ensures passwords match
        .optional()
        .messages({ 'any.only': 'Passwords do not match' }) // Custom error message for mismatch
}).options({ abortEarly: false });

exports.loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format'
        }),
    password: Joi.string()
        .min(6) // Minimum length for password
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters long'
        })
}).options({ abortEarly: false });

exports.checkPasswordSchema = Joi.object({
    password: Joi.string()
        .min(6) // Minimum length for password
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters long'
        })
}).options({ abortEarly: false });

exports.emailPhoneSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format'
        })
}).options({ abortEarly: false });

exports.otpSchema = Joi.object({
    otp: Joi.string()
        .length(6) // Assuming OTP is a 6-digit number
        .pattern(/^[0-9]+$/) // Ensures OTP contains only numbers
        .required()
        .messages({
            'string.empty': 'OTP is required',
            'string.length': 'OTP must be exactly 6 digits long',
            'string.pattern.base': 'OTP must contain only numbers'
        })
}).options({ abortEarly: false });

exports.resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
}).options({ abortEarly: false });

exports.maintenanceSchema = Joi.object({
    maintenanceAmount: Joi.number().required(),
    penaltyAmount: Joi.number().required(),
    maintenanceDueDate: Joi.date().required(),
    penaltyAppliedAfterDays: Joi.number().required(),
});

exports.residentSchema = Joi.object({
    wing: Joi.string().required(),
    unit: Joi.string().required(),
});

exports.announcementSchema = Joi.object({
  Announcement_type: Joi.boolean().valid(true, false).required(),  // true for Event, false for Activity
  Announcement_title: Joi.string().required(),
  description: Joi.string().required(),
  amount: Joi.number().required(),
  date: Joi.date().required(),
  time: Joi.string().optional(),
  status: Joi.string().valid('Pending', 'Done').optional(),
  paymentType: Joi.string().valid('Online', 'Cash').optional(),
});

// ----------------------------Announcement-Validation---------------------

exports.createAnnouncementSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().iso().required(),
    time: Joi.string().required()
}).options({ abortEarly: false });

exports.updateAnnouncementSchema = Joi.object({
    title: Joi.string().optional(), // Title is optional
    description: Joi.string().optional(), // Description is optional
    date: Joi.date().iso().optional(), // Date must be a valid ISO date and is optional
    time: Joi.string().optional() // Time is optional
}).options({ abortEarly: false }); // Collect all errors instead of stopping at the first


