const Visitor = require("../models/visitor.model");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");



const addVisitor = async (req: any, res: any) => {
    try {
        const { name, phoneNumber, wing, unit, date, time, society } = req.body;
        if (!name || !phoneNumber || !wing || !unit || !date || !time || !society) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const visitor = new Visitor({ name, phoneNumber, wing, unit, date, time, society });
        await visitor.save();

        const io = req.app.get("io");
        io.emit("notification", {
            title: "New Visitor",
            message: `A visitor "${visitor.name}" has arrived for Unit ${visitor.unit}.`,
            type: "info",
        });

        res.status(201).json({ message: "Visitor added successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
const getAllvisitor = async (req: any, res: any) => {
    try {
        const { role, id } = req.user;
        const { societyId } = req.query;
        let query: any = {};

        if (role === "admin") {
            if (societyId) {
                query.society = societyId;
            } else {
                const admin = await Auth.findById(id);
                if (!admin || !admin.selectSociety || admin.selectSociety.length === 0) {
                    return res.status(200).json({ data: [] });
                }
                const societies = await Society.find({
                    societyName: { $in: admin.selectSociety },
                });
                const societyIds = societies.map((s: any) => s._id);
                query.society = { $in: societyIds };
            }
        } else if (role === "resident") {
            const resident = await Auth.findById(id);
            if (!resident || !resident.society) {
                return res.status(404).json({ message: "Society not found for resident" });
            }
            query.society = resident.society;
        }

        const visitors = await Visitor.find(query).sort({ createdAt: -1 });
        return res.status(200).json({
            message: "Visitors fetched successfully",
            data: visitors,
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
}

module.exports = { addVisitor,getAllvisitor };
