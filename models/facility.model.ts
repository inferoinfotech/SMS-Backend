const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        scheduleServiceDate: {
            type: Date,
            require: true,
        },
        remindBefore:{
            type: Number,
            require: true,
        },
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Facility", FacilitySchema);