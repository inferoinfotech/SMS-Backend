const mongoose = require("mongoose");

const ExpanseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    uploadBill: {
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
  },
);

module.exports = mongoose.model("Expanse", ExpanseSchema);
