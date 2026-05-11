const Visitor = require("../models/visitor.model");



const addVisitor = async (req: any, res: any) => {
    try {
        const { name, phoneNumber, wing, unit, date, time,society } = req.body;
        if (!name || !phoneNumber || !wing || !unit || !date || !time || !society) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const visitor = new Visitor({ name, phoneNumber, wing, unit, date, time,society });
        await visitor.save();
        res.status(201).json({ message: "Visitor added successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
const getAllvisitor = async (req: any, res: any) => {

    const { societyId } = req.query;
    const society = req.user.society || societyId;
    try {
        const visitors = await Visitor.find({society:society});
        return res.status(200).json({
            message: "Visitors fetched successfully",
            data: visitors,
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { addVisitor,getAllvisitor };
