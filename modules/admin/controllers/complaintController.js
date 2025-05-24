const { Complaint, Resident } = require("../models");

// Create a New Complaint
exports.createComplaint = async (req, res) => {
    try {
        const { wing, unit, ...complaintData } = req.body;
        
        const existingResident = await Resident.findOne({
            wing,
            unit,
            isDeleted: false,
        });

        if (!existingResident) {
            return res.status(400).json({
                message: `The provided wing "${wing}" and unit "${unit}" do not exist or are invalid.`,
            });
        }

        // Determine who is creating the complaint
        let createdBy;
        if (req.admin && req.admin._id) {
            createdBy = req.admin._id; // Admin creating the complaint
        } else if (req.resident && req.resident._id) {
            createdBy = req.resident._id; // Resident creating the complaint
        } else {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: No valid user information found.",
            });
        }

        // Create a new complaint with the residentId, createdBy, and society fields populated
        const complaint = new Complaint({
            ...complaintData,
            wing,
            unit,
            residentId: existingResident._id,
            society: existingResident.society,
            createdBy,
            isDeleted: false,
        });

        await complaint.save();

        res.status(201).json({
            success: true,
            message: "Complaint created successfully",
            complaint,
        });
    } catch (error) {
        console.error("Error creating complaint:", error);
        res.status(500).json({ message: "Error creating complaint", error: error.message });
    }
};

// Fetch All Complaints
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ society: req.society._id,isDeleted: false }).populate('residentId').populate('society');
        if (complaints.length === 0) {
            return res.status(404).json({ message: "No complaints found" });
        }
        res.status(200).json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fetch a Single Complaint by ID
exports.getComplaintById = async (req, res) => {
    try {
        const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false })
            .populate('residentId')
            .populate('society');
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        res.status(200).json(complaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a Complaint
exports.updateComplaint = async (req, res) => {
    try {
        const { wing, unit, ...updateData } = req.body;

        let residentId = null;

        // Check if wing or unit is provided and find the corresponding resident
        if (wing || unit) {
            const existingResident = await Resident.findOne({
                ...(wing && { wing }),
                ...(unit && { unit }),
                isDeleted: false,
            });

            if (!existingResident) {
                return res.status(400).json({
                    message: `The provided wing "${wing}" and unit "${unit}" do not exist or are invalid.`,
                });
            }

            // Set the residentId if a valid resident is found
            residentId = existingResident._id;
        }

        // Update the complaint with the new data
        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            {
                ...updateData,
                ...(wing && { wing }),
                ...(unit && { unit }),
                ...(residentId && { residentId }),
            },
            { new: true, runValidators: true }
        );

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found or already deleted" });
        }

        res.status(200).json(complaint);
    } catch (error) {
        console.error("Error updating complaint:", error);
        res.status(500).json({ message: "Error updating complaint", error: error.message });
    }
};

// Soft Delete a Complaint
exports.deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }
        res.status(200).json({ message: "Complaint deleted", complaint });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};