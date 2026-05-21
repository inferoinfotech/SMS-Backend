const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    alertType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc: any, ret: any) => {
        delete ret.__v;
        delete ret.updatedAt;
        return ret;
      },
    },
  },
);

const Emergency = mongoose.model("Emergency", emergencySchema);
module.exports = Emergency;
