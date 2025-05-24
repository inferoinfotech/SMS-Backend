const mongoose = require('mongoose');

const SecurityProtocolSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society',  },
    isDeleted: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

const SecurityProtocol = mongoose.models.SecurityProtocol || mongoose.model('SecurityProtocol', SecurityProtocolSchema);
module.exports = SecurityProtocol;
