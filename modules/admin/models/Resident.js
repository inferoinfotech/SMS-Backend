const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const imageSchema = {
  profilePhoto: String,
  frontAadharCard: String,
  backAadharCard: String,
  addressProof: String,
  rentAgreement: String,
};

const memberSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: String,
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  relation: String
});

const vehicleSchema = new mongoose.Schema({
  vehicleType: String,
  vehicleName: String,
  vehicleNumber: String
});

const residentSchema = new mongoose.Schema({
  owner: { type: Boolean, required: true }, // true for Owner, false for Tenant
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  age: Number,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  wing: String,
  unit: String,
  relation: String,
  ownerDetails: {
    ownerFullName: String,
    ownerPhoneNumber: String,
    ownerAddress: String
  },
  images: imageSchema,
  members: [memberSchema],
  vehicles: [vehicleSchema],
  isOccupied: { type: Boolean, default: true }, // true for occupied, false for vacated
  role: {
    type: String,
    enum: ['admin', 'resident', 'security'],
    default: 'resident'
  },
  password: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false 
  }

}, { timestamps: true });

residentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

residentSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

residentSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: 'resident' }, process.env.JWT_SECRET, { expiresIn: '1d' });
};


const Resident = mongoose.models.Resident || mongoose.model('Resident', residentSchema);
module.exports = Resident;
