const ImportantNumber = require("../models/importantNumber.model");
const Auth = require("../models/auth.model");
const Society = require("../models/society.model");

const createImportantNumber = async (req: any, res: any) => {
  try {
    const { name, number, work, society } = req.body;
    if (!name || !number || !work || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const importantNumber = await ImportantNumber.create({
      name,
      number,
      work,
      society,
    });

    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Contact",
      message: `Important number for "${importantNumber.name}" added.`,
      type: "success",
    });

    res.status(201).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllImportantNumber = async (req: any, res: any) => {
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
          return res.status(200).json({ importantNumber: [] });
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

    const importantNumber = await ImportantNumber.find(query).sort({ createdAt: -1 });
    res.status(200).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editImportantNumber = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { name, number, work } = req.body;
    const importantNumber = await ImportantNumber.findByIdAndUpdate(
      id,
      { name, number, work },
      { new: true },
    );
    if (!importantNumber) {
      return res.status(404).json({ message: "Important number not found" });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Contact Updated",
      message: `Important number for "${importantNumber.name}" updated.`,
      type: "info",
    });

    res.status(200).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteImportantNumber = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const importantNumber = await ImportantNumber.findByIdAndDelete(id);
    if (!importantNumber) {
      return res.status(404).json({ message: "Important number not found" });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Contact Deleted",
      message: `Important number for "${importantNumber.name}" removed.`,
      type: "warning",
    });

    res.status(200).json({ importantNumber });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createImportantNumber,
  getAllImportantNumber,
  editImportantNumber,
  deleteImportantNumber,
};
