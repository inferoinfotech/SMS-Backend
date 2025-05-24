const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  isDeleted: { type: Boolean, default: false }

}, {
  timestamps: true
});

const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
module.exports = Note;