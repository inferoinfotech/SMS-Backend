const { SecurityProtocol } = require("../models");

// Create Security-Protocol
exports.createProtocol = async (req, res) => {
    const { title, description, date, time } = req.body;
    try {
        const protocol = new SecurityProtocol({ title, description, date, time, isDeleted: false });
        await protocol.save();
        res.status(201).json(protocol);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Security-Protocol
exports.getAllProtocols = async (req, res) => {
    try {
        const protocols = await SecurityProtocol.find({ society: req.society._id, isDeleted: false });
        if (protocols.length === 0) {
            return res.status(404).json({ message: 'No protocols found' });
        }
        res.json(protocols);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get By ID Security-Protocol
exports.getProtocolById = async (req, res) => {
    try {
        const protocol = await SecurityProtocol.findOne({ _id: req.params.id, isDeleted: false });
        if (!protocol) {
            return res.status(404).json({ message: 'Protocol not found' });
        }
        res.json(protocol);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Security-Protocol
exports.updateProtocol = async (req, res) => {
    try {
        const updatedProtocol = await SecurityProtocol.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            req.body,
            { new: true }
        );
        if (!updatedProtocol) {
            return res.status(404).json({ message: 'Protocol not found' });
        }
        res.json(updatedProtocol);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Security-Protocol
exports.deleteProtocol = async (req, res) => {
    try {
        const protocol = await SecurityProtocol.findOneAndUpdate(
            { _id: req.params.id, isDeleted: false },
            { isDeleted: true },
            { new: true }
        );
        if (!protocol) {
            return res.status(404).json({ message: 'Protocol not found' });
        }
        res.json({ message: 'Protocol deleted successfully', protocol });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
