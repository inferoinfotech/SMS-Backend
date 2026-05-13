const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["success", "error", "warning", "info"],
        default: "info"
    },
    status: {
        type: String,
        enum: ["read", "unread"],
        default: "unread"
    },
    society: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Society"
    }
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
