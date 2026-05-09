const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: String,
  age: Number,
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  relation: String,
});

const residentSchema = new mongoose.Schema({
  name: {
    type: String,

    trim: true,
  },
  email: {
    type: String,

    unique: true,
    trim: true,
    lowercase: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  wing: {
    type: String,
    required: true,
    trim: true,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  residentStatus: {
    type: String,
    enum: ["Owner", "Tenant"],
    required: true,
  },
  unitStatus: {
    type: String,
    enum: ["Vacant", "Occupied"],
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    trim: true,
  },
  // address: {
  //   type: String,
  //   required: true,
  //   trim: true,
  // },
  profileImage: {
    type: String,
    default: "",
  },
  relation: {
    type: String,
    required: true,
    trim: true,
  },
  uploadAadharfront: {
    type: String,
    default: "",
  },
  uploadAadharback: {
    type: String,
    default: "",
  },
  uploadPan: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    default: "",
  },

  addressProof: {
    type: String,
    default: "",
  },
  rentAgreeMent: {
    type: String,
    default: "",
  },
  members: [memberSchema],
  memberCount: {
    type: Number,
    default: 1,
  },

  vehicles: [
    {
      vehicleType: {
        type: String,
        enum: ["Car", "Bike", "Scooter", "Other"],
      },
      vehicleName: {
        type: String,

        trim: true,
      },
      vehicleNumber: {
        type: String,
        sparse: true,
        unique: true,
        trim: true,
      },
    },
  ],
  society: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Society",
    required: true,
  },
});

module.exports = mongoose.model("Resident", residentSchema);
