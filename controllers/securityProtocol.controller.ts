const SecurityProtocol = require("../models/securityProtocol");

const createSecurityProtocol = async function (req:any, res:any) {
    try {
        const { title, description } = req.body;
        const securityProtocol = await SecurityProtocol.create({
            title,
            description,
        });
        res.status(201).json({ securityProtocol });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const editSecurityProtocol = async function (req:any, res:any) {
    try {
        const id = req.params.id;
        const { title, description,date , time } = req.body;
        const securityProtocol = await SecurityProtocol.findByIdAndUpdate(id, {
            title,
            description,
            date,
            time,
        }, { new: true });
        res.status(200).json({ securityProtocol });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const deleteSecurityProtocol = async function (req:any, res:any) {
    try {
        const id = req.params.id;
        const securityProtocol = await SecurityProtocol.findByIdAndDelete(id);
        res.status(200).json({ securityProtocol });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const getAllSecurityProtocol = async function (req:any, res:any) {
    try {
        const securityProtocol = await SecurityProtocol.find();
        res.status(200).json({ securityProtocol });
    } catch (error:any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createSecurityProtocol, editSecurityProtocol, deleteSecurityProtocol, getAllSecurityProtocol };