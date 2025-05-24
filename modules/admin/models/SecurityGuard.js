const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SecurityGuardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    shift: {
        type: String,
        required: true,
    },
    shiftDate: {
        type: Date,
        required: true,
    },
    shiftTime: {
        type: String,
        required: true,
    },
    aadharCard: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ['admin', 'resident', 'security'],
        default: 'security'
      },
    password: {
        type: String,
        required: true,
    },
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    isDeleted: {
        type: Boolean,
        default: false 
    }
    
}, { timestamps: true });

SecurityGuardSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

SecurityGuardSchema.methods.matchPassword = async function (enteredPassword) {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;
};

SecurityGuardSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const SecurityGuard = mongoose.models.SecurityGuard || mongoose.model('SecurityGuard', SecurityGuardSchema);
module.exports = SecurityGuard;