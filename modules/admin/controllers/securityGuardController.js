const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sendEmailToSecurityGuard } = require('../../utils/sendEmailWithPassword');
const { SecurityGuard } = require('../models');

exports.createSecurityGuard = async (req, res) => {
    const { name, email, phoneNumber, gender, shift, shiftDate, shiftTime } = req.body;

    if (!name || !email || !phoneNumber || !gender || !shift || !shiftDate || !shiftTime) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields. Please ensure all required fields are provided."
        });
    }    

    const society = req.society;
    if (!society) {
        return res.status(400).json({
            success: false,
            message: "Society not found. Please ensure that admin has a valid society."
        });
    }

    const photo = req.files?.photo ? req.files.photo[0].filename : undefined;
    const aadharCard = req.files?.aadharCard ? req.files.aadharCard[0].filename : undefined;

    const password = crypto.randomBytes(8).toString('hex');
    console.log("Generated password:", password);

    try {
        const guard = new SecurityGuard({
            name,
            email,
            phoneNumber,
            gender,
            shift,
            shiftDate,
            shiftTime,
            aadharCard,
            photo,
            password,
            society,
            createdBy: req.admin._id,
        });
        await guard.save();

        await sendEmailToSecurityGuard(email, password);

        res.status(201).json({
            success: true,
            message: 'Security guard created successfully!',
            data: guard,
            token: guard.getSignedJwtToken(),
        });
    } catch (error) {
        console.error("Error creating security guard:", error);
        res.status(500).json({
            success: false,
            message: "Error creating security guard",
            error: error.message,
        });
    }
};

// Get all Security Guards
exports.getAllSecurityGuards = async (req, res) => {
    try {
        const guards = await SecurityGuard.find({ society: req.society._id, isDeleted: false })
            .populate('society', 'name')
            .populate('createdBy', 'name email');

        if (guards.length === 0) {
            return res.status(404).json({ success: false, message: 'No security guards found' });
        }

        res.status(200).json({ success: true, data: guards });
    } catch (error) {
        console.error("Error fetching security guards:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a Security Guard by ID
exports.getSecurityGuardById = async (req, res) => {
    try {
        const guard = await SecurityGuard.findOne({ _id: req.params.id, society: req.society._id, isDeleted: false })
            .populate('society', 'name')
            .populate('createdBy', 'name email');

        if (!guard) {
            return res.status(404).json({ success: false, message: 'Guard not found' });
        }

        res.status(200).json({ success: true, data: guard });
    } catch (error) {
        console.error("Error fetching security guard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a Security Guard
exports.updateSecurityGuard = async (req, res) => {
    try {
        const guard = await SecurityGuard.findOne({ _id: req.params.id, society: req.society._id, isDeleted: false });
        if (!guard) {
            return res.status(404).json({ success: false, message: 'Guard not found' });
        }

        // Handle file updates (photo and aadharCard)
        if (req.files?.photo) {
            if (guard.photo) {
                fs.unlink(path.join(__dirname, '..', guard.photo), (err) => {
                    if (err) console.error("Error deleting old photo:", err);
                });
            }
            guard.photo = `uploads/${req.files.photo[0].filename}`;
        }

        if (req.files?.aadharCard) {
            if (guard.aadharCard) {
                fs.unlink(path.join(__dirname, '..', guard.aadharCard), (err) => {
                    if (err) console.error("Error deleting old Aadhar card:", err);
                });
            }
            guard.aadharCard = `uploads/${req.files.aadharCard[0].filename}`;
        }

        // Update other fields
        Object.assign(guard, req.body);

        const updatedGuard = await guard.save();
        res.status(200).json({
            success: true,
            message: 'Guard updated successfully!',
            data: updatedGuard,
        });
    } catch (error) {
        console.error("Error updating security guard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a Security Guard
exports.deleteSecurityGuard = async (req, res) => {
    try {
        const guard = await SecurityGuard.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );

        if (!guard) {
            return res.status(404).json({ success: false, message: 'Guard not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Guard deleted successfully!',
            data: guard,
        });
    } catch (error) {
        console.error("Error deleting security guard:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
