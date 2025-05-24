
const mongoose = require('mongoose');
const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 10); // Generates a random string of 8 characters
  };

const maintenanceSchema = new mongoose.Schema({
    maintenanceAmount: {
        type: Number,
        required: true,
    },
    penaltyAmount: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    maintenanceDueDate: {
        type: Date,
        required: true,
    },
    penaltyAppliedAfterDays: {
        type: Number,
        required: true,
    },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident', required: true },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    status: {
        type: String,
        enum: ['Pending', 'Done', 'Rejected'],
        default:"Pending",
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['Online', 'Cash'],
        required: false,
    },
    invoiceId: {
        type: String,
        default: generateUniqueId,
      },
    paymentDate: {
        type: Date,
        default: null,
    },
    isExtraAmountAdded: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false 
    }
},{
    timestamps:true,
});

module.exports =  mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);

