const Complain = require("../models/complain.model");

const createComplain = async (req: any, res: any) => {
  try {
    const {
      compainerName,
      wing,
      unit,
      complainName,
      description,
      status,
      priority, 
      society
    } = req.body;

    if (
      !compainerName ||
      !wing ||
      !unit ||
      !complainName ||
      !description ||
      !status ||
      !priority ||
      !society
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complain = await Complain.create({
      compainerName,
      wing,
      unit,
      complainName,
      description,
      status,
      priority,
      society,
    });
    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Complaint",
      message: `A new complaint "${complain.complainName}" has been filed by ${complain.compainerName}.`,
      type: "warning",
    });

    res.status(201).json({ complain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const editComplain = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { compainerName, wing, unit, complainName, description, status, priority } = req.body;

    const updateComplain = await Complain.findByIdAndUpdate(
      id,
      {
        compainerName,
        wing,
        unit,
        complainName,
        description,
        status,
        priority,
      },
      { new: true },
    );

    if (!updateComplain) {
      return res.status(404).json({ message: "Complain not found" });
    }
    const io = req.app.get("io");
    io.emit("notification", {
      title: "Complaint Updated",
      message: `Complaint "${updateComplain.complainName}" status has been updated to ${updateComplain.status}.`,
      type: "info",
    });

    res.status(200).json({ updateComplain });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComplain = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const deletedComplain = await Complain.findByIdAndDelete(id);
    if (!deletedComplain) {
      return res.status(404).json({ message: "Complain not found" });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Complaint Deleted",
      message: `Complaint "${deletedComplain.complainName}" has been removed.`,
      type: "warning",
    });

    res.status(200).json({ deletedComplain });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllComplain = async (req: any, res: any) => {
  try {
    const { role, id } = req.user;
    const { societyId } = req.query;
    let query: any = {};

    if (role === "admin") {
      if (societyId) {
        query.society = societyId;
      } else {
        const Auth = require("../models/auth.model");
        const Society = require("../models/society.model");
        const admin = await Auth.findById(id);
        if (!admin || !admin.selectSociety || admin.selectSociety.length === 0) {
          return res.status(200).json({ complainList: [] });
        }
        const societies = await Society.find({
          societyName: { $in: admin.selectSociety },
        });
        const societyIds = societies.map((s: any) => s._id);
        query.society = { $in: societyIds };
      }
    } else if (role === "resident") {
      const Auth = require("../models/auth.model");
      const resident = await Auth.findById(id);
      if (!resident || !resident.society) {
        return res.status(404).json({ message: "Society not found for resident" });
      }
      query.society = resident.society;
    }

    const complainList = await Complain.find(query).sort({ createdAt: -1 });
    res.status(200).json({ complainList });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { createComplain , editComplain , deleteComplain , getAllComplain};
