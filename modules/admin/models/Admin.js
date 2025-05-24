const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String,
    required: false,
    unique: true,
    validate: [validator.isEmail, 'Invalid email address'],
  },
  phoneNumber: {
    type: String,
    required: false,
    validate: [validator.isMobilePhone, 'Invalid phone number'],
  },
  country: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
  password: { type: String, required: true, minlength: 6 },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ['admin', 'resident', 'security'],
    default: 'admin'
  },
  otp: { type: String },
  otpExpires: { type: Date },
  // deviceToken: { type: String }, // FCM device token
});

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

AdminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Password match function
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

module.exports = Admin;