const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },

    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true}
);
const Income = mongoose.models.Income || mongoose.model('Income', incomeSchema);
module.exports = Income;