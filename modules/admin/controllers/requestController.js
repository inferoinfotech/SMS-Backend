const { createRequestSchema } = require('../../Resident/joi');
const { Request, Resident } = require('../models');

exports.createRequest = async (req, res) => {
    try {

        const { error } = createRequestSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { wing, unit } = req.body;
        let society;

        if (!wing || !unit) {
            return res.status(400).json({
                message: "Wing and unit are required fields.",
            });
        }

        const resident = await Resident.findOne({ wing, unit, isDeleted: false });
        if (!resident) {
            return res.status(400).json({
                message: `The wing "${wing}" and unit "${unit}" are either invalid or do not exist.`,
            });
        }

        if (req.admin) {
            society = req.admin.society;
            if (!society) {
                return res.status(400).json({
                    message: "Admin does not belong to any society.",
                });
            }
        } else if (req.resident) {
            society = resident.society;
            if (!society) {
                return res.status(400).json({
                    message: "The resident does not belong to any society.",
                });
            }
        } else {
            return res.status(400).json({
                message: "Unable to determine society.",
            });
        }

        const request = new Request({
            ...req.body,
            residentId: resident._id,
            society,
            createdBy: req.admin ? req.admin._id : resident._id,
            isDeleted: false,
        });

        await request.save();
        res.status(201).json({
            success: true,
            message: 'Request created successfully',
            request,
        });
    } catch (error) {
        console.error("Error creating request:", error);
        res.status(500).json({ success: false, message: "Error creating request", error: error.message });
    }
};

// Get all requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find({society: req.society._id,isDeleted: false })
            .populate('residentId', 'name wing unit')
            .populate('society', 'name')
            .populate('createdBy', 'name');

        if (!requests.length) {
            return res.status(404).json({ success: false, message: "No requests found" });
        }

        res.status(200).json({
            success: true,
            message: 'Requests fetched successfully',
            requests,
        });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ success: false, message: "Error fetching requests", error: error.message });
    }
};



// Get a request by ID
exports.getRequestById = async (req, res) => {
    try {
        const request = await Request.findOne({ _id: req.params.id, isDeleted: false })
            .populate('residentId', 'name wing unit')
            .populate('society', 'name')
            .populate('createdBy', 'name');

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({
            success: true,
            message: 'Request fetched successfully',
            request,
        });
    } catch (error) {
        console.error("Error fetching request:", error);
        res.status(500).json({ success: false, message: "Error fetching request", error: error.message });
    }
};

// Update a request
exports.updateRequest = async (req, res) => {
    try {
        const { wing, unit, ...updateData } = req.body;

        if (wing || unit) {
            const resident = await Resident.findOne({ wing, unit, isDeleted: false });
            if (!resident) {
                return res.status(400).json({
                    message: `The provided wing "${wing}" and unit "${unit}" do not exist or are invalid.`,
                });
            }
            updateData.residentId = resident._id;
        }
        
        const request = await Request.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { ...updateData, ...(wing && { wing }), ...(unit && { unit }) },
            { new: true, runValidators: true }
        ).populate('residentId', 'name wing unit');

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found or already deleted" });
        }

        res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            request,
        });
    } catch (error) {
        console.error("Error updating request:", error);
        res.status(500).json({ success: false, message: "Error updating request", error: error.message });
    }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
    try {
        const request = await Request.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
            request,
        });
    } catch (error) {
        console.error("Error deleting request:", error);
        res.status(500).json({ success: false, message: "Error deleting request", error: error.message });
    }
};
