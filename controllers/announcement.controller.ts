const Announcement = require("../models/announcement.model");

const createAnnouncement = async function (req: any, res: any) {
  try {
    const {
      title,
      description,
      announcementType,
      date,
      time,
      society,
      amount,
    } = req.body;
    if (!title || !description || !announcementType || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const announcement = await Announcement.create({
      title,
      description,
      announcementType,
      date,
      time,
      society,
      amount,
    });
    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Announcement",
      message: `A new announcement "${announcement.title}" has been posted.`,
      type: "info",
    });

    res.status(201).json({ announcement });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const editAnnouncement = async function (req: any, res: any) {
  try {
    const id = req.params.id;
    const { title, description, announcementType, date, time, amount } =
      req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      {
        title,
        description,
        announcementType,
        date,
        time,
        amount,
      },
      { new: true },
    );
    const io = req.app.get("io");
    io.emit("notification", {
      title: "Announcement Updated",
      message: `Announcement "${announcement.title}" has been updated.`,
      type: "info",
    });

    res.status(200).json({ announcement });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAnnouncement = async function (req: any, res: any) {
  try {
    const id = req.params.id;
    const announcement = await Announcement.findByIdAndDelete(id);

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Announcement Deleted",
      message: `Announcement "${announcement.title}" has been removed.`,
      type: "warning",
    });

    res.status(200).json({ announcement });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllAnnouncement = async function (req: any, res: any) {
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
        if (
          !admin ||
          !admin.selectSociety ||
          admin.selectSociety.length === 0
        ) {
          return res.status(200).json({ announcement: [] });
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
        return res
          .status(404)
          .json({ message: "Society not found for resident" });
      }
      query.society = resident.society;
    }

    const announcement = await Announcement.find(query)
      .select("-__v -updatedAt")
      .sort({ createdAt: -1 });
    res.status(200).json({ announcement });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  getAllAnnouncement,
};
