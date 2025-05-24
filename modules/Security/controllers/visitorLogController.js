const { VisitorLog } = require("../models");

exports.createVisitorLog = async (req, res) => {
    const { name, number, date, wing, unitNumber, time } = req.body;

    if (!req.society) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Society information is missing.",
        });
    }

    const society = req.society._id;

    try {
        const visitor = new VisitorLog({
            name,
            number,
            date,
            wing,
            unitNumber,
            time,
            society,
        });

        await visitor.save();

        res.status(201).json({
            success: true,
            message: "Visitor log created successfully!",
            data: visitor,
        });
    } catch (error) {
        console.error("Error creating visitor log:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create visitor log",
            error: error.message,
        });
    }
};

exports.getAllVisitorLogs = async (req, res) => {
    try {
        const visitors = await VisitorLog.find();
        
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