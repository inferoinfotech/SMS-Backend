
const { Request, Resident } = require('../../admin/models');
exports.getRequests = async (req, res) => {
    try {
        const requests = await Request.find( { society:req.society._id, isDeleted: false } )
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