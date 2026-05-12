const Facility = require("../models/facility.model");

const addFacility = async (req: any, res: any) => {
  try {
    const { name, description, scheduleServiceDate, remindBefore, society } = req.body;
    if (!name || !description || !scheduleServiceDate || !remindBefore || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const facility = await Facility.create({
      name,
      description,
      scheduleServiceDate,
      remindBefore,
      society,
    });

    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Facility",
      message: `A new facility "${facility.name}" has been added.`,
      type: "success",
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

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Facility Updated",
      message: `Facility "${facility.name}" has been updated.`,
      type: "info",
    });

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

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Facility Deleted",
      message: `Facility "${facility.name}" has been removed.`,
      type: "warning",
    });

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
          return res.status(200).json({ data: [] });
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

    const facility = await Facility.find(query).sort({ createdAt: -1 });
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