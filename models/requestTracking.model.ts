const mongoose = require("mongoose");

const requestTrackingSchema = new mongoose.Schema(
    {
        requesterName: {
            type: String,
            required: true
        },

        requestName: {
            type: String,
            required: true
        },

        wing: {
            type: String,
            required: true
        },

        unit: {
            type: String,
            required: true
        },
        description: {
            type: String,
        },

        status: {
            type: String,
            enum: ["Open", "Pending", "Solved"],
            default: "Open"
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium"
        },
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("RequestTracking", requestTrackingSchema);