const Facility = require("../models/facility.model");

const addFacility = async (req: any, res: any) => {
    try {
        const { name, description, scheduleServiceDate, remindBefore } = req.body;
        if (!name || !description || !scheduleServiceDate || !remindBefore) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const facility = await Facility.create({
            name,
            description,
            scheduleServiceDate,
            remindBefore,
        });
        return res.status(201).json({
            message: "Facility added successfully",
            data: facility,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
};  

const editFacility = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const { name, description, scheduleServiceDate, remindBefore } = req.body;
        const facility = await Facility.findByIdAndUpdate(
            id,
            {
                name,
                description,
                scheduleServiceDate,
                remindBefore,
            },
            { new: true },
        );
        if (!facility) {
            return res.status(404).json({ message: "Facility not found" });
        }
        return res.status(200).json({
            message: "Facility updated successfully",
            data: facility,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

const deleteFacility = async (req: any, res: any) => {
    try {
        const id = req.params.id;
        const facility = await Facility.findByIdAndDelete(id);
        if (!facility) {
            return res.status(404).json({ message: "Facility not found" });
        }
        return res.status(200).json({
            message: "Facility deleted successfully",
            data: facility,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

const getFacility = async (req: any, res: any) => {
    try {
        const facility = await Facility.find();
        return res.status(200).json({
            message: "Facility fetched successfully",
            data: facility,
        });
    } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
};

module.exports = { addFacility, editFacility, deleteFacility, getFacility };