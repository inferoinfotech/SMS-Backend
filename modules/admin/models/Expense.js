const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  bill: { type: String },
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true,
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
module.exports = Expense;