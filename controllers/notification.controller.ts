const Notification = require("../models/notification.model");

const getNotifications = async (req: any, res: any) => {
    try {
        const userId = req.user.id || req.user._id;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ success: true, notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markAsRead = async (req: any, res: any) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { status: "read" });
        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const clearAll = async (req: any, res: any) => {
    try {
        const userId = req.user.id || req.user._id;
        await Notification.deleteMany({ userId });
        res.status(200).json({ success: true, message: "All notifications cleared" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    clearAll
};
