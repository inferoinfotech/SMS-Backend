const SecurityProtocol = require("../models/securityProtocol");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");

const createSecurityProtocol = async function (req: any, res: any) {
    try {
        const { title, description, society } = req.body;
        const securityProtocol = await SecurityProtocol.create({
            title,
            description,
            society,
        });

        const io = req.app.get("io");
        io.emit("notification", {
            title: "New Protocol",
            message: `New security protocol "${title}" created.`,
            type: "success",
        });

        res.status(201).json({ securityProtocol });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const editSecurityProtocol = async function (req: any, res: any) {
    try {
        const id = req.params.id;
        const { title, description, date, time } = req.body;
        const securityProtocol = await SecurityProtocol.findByIdAndUpdate(id, {
            title,
            description,
            date,
            time,
        }, { new: true });

        const io = req.app.get("io");
        io.emit("notification", {
            title: "Protocol Updated",
            message: `Security protocol "${securityProtocol.title}" has been updated.`,
            type: "info",
        });

        res.status(200).json({ securityProtocol });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const deleteSecurityProtocol = async function (req: any, res: any) {
    try {
        const id = req.params.id;
        const securityProtocol = await SecurityProtocol.findByIdAndDelete(id);

        const io = req.app.get("io");
        io.emit("notification", {
            title: "Protocol Deleted",
            message: `Security protocol "${securityProtocol.title}" has been removed.`,
            type: "warning",
        });

        res.status(200).json({ securityProtocol });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const getAllSecurityProtocol = async function (req: any, res: any) {
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

        const securityProtocol = await SecurityProtocol.find(query).sort({ createdAt: -1 });
        res.status(200).json({ securityProtocol });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createSecurityProtocol, editSecurityProtocol, deleteSecurityProtocol, getAllSecurityProtocol };