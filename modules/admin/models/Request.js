const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    requestName: { type: String, required: true },
    requesterName: { type: String, required: true },
    description:{type:String, required: true},
    date: { type: Date, required: true },
    wing: { type: String, required: true },
    unit: { type: String, required: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    status: { type: String, enum: ['Open', 'Pending', 'Solved'], default: 'Open' },
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.models.Request || mongoose.model('Request', RequestSchema);
