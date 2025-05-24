// Backend/modules/Security/models/VisitorLog.js
const mongoose = require('mongoose');

const VisitorLogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    wing: {
        type: String,
        required: true
    },
    unitNumber: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Society'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
       
    }
}, { timestamps: true });

const VisitorLog = mongoose.models.VisitorLog || mongoose.model('VisitorLog', VisitorLogSchema);

module.exports = VisitorLog;
