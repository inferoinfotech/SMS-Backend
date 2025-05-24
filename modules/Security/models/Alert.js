const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  alertType: { type: String, required: true },
  description: { type: String, required: true },
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true }
  
}, { timestamps: true });

module.exports = mongoose.model('Alert', AlertSchema);
