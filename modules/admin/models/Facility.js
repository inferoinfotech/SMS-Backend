const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  serviceDate: { type: Date, required: true },
  remindBeforeDate: { type: Number, required: true },
  residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident'},
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
  isDeleted: { type: Boolean, default: false }
});

const Facility = mongoose.models.Facility || mongoose.model("Facility", facilitySchema);
module.exports = Facility;