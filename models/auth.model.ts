const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  age: Number,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  relation: String,
});

const authSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      trim: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "resident", "guard"],
      default: "admin",
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
    },

    // Admin Specific
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    selectSociety: { type: [String], default: [] },

    // Resident Specific
    wing: { type: String },
    unit: { type: String },
    residentStatus: { type: String, enum: ["Owner", "Tenant"] },
    unitStatus: { type: String, enum: ["Vacant", "Occupied"], default: "Occupied" },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    relation: { type: String },
    members: [memberSchema],
    vehicles: [
      {
        vehicleType: { type: String, enum: ["Car", "Bike", "Scooter", "Other"] },
        vehicleName: String,
        vehicleNumber: String,
      },
    ],




    // Guard Specific
    shift: { type: String, enum: ["Day", "Night"] },
    shiftDate: { type: Date },
    shiftTime: { type: String },

    // System Fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    resetOtp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Auth", authSchema);
