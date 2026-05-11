const mongoose =require("mongoose");

const VisitorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        wing: {
            type: String,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        society: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Society",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Visitor", VisitorSchema);
