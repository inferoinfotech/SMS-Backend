const { VisitorLog } = require("../../Security/models");

exports.getAllVisitorLogs = async (req, res) => {
    try {
        const visitors = await VisitorLog.find({society: req.society._id});
        
        if (!visitors.length) {
            return res.status(404).json({
                success: false,
                message: "No visitor logs found",
            });
        }

        res.status(200).json({
            success: true,
            data: visitors,
        });
    } catch (error) {
        console.error("Error fetching visitor logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch visitor logs",
            error: error.message,
        });
    }
};
