const mongoose = require("mongoose");

const MaintenanceSettingSchema = new mongoose.Schema(
  {
    maintenanceAmount: {
      type: Number,
      required: true
    },
    penaltyAmount: {
      type: Number,
      required: true
    },
    maintenanceDueDate: {
      type: Date,
      required: true
    },
    penaltyAppliedAfterDay: {
      type: Number,
      required: true
    },
    password: {
      type: String,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("MaintenanceSetting", MaintenanceSettingSchema);