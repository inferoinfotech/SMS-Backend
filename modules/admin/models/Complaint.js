const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    complaintName: { type: String, required: true },
    complainerName: { type: String, required: true },
    description: { type: String, required: true },
    wing: { type: String, required: true },
    unit: { type: String, required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: { type: String, enum: ['Open', 'Pending', 'Solved'], default: 'Open' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
module.exports = Complaint;
