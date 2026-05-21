const Emergency = require("../models/emergency.model");
const Auth = require("../models/auth.model");
require("dotenv").config();
const transporter = require("../utils/nodemailer/transporter");
const Society = require("../models/society.model");
const Notification = require("../models/notification.model");

const createEmergency = async function (req: any, res: any) {
  try {
    //if role resident then society is automatically selected
    //if role admin then society is selected from the body
    const { role, id } = req.user;
    const { alertType, description, society } = req.body;

    let targetSociety = society;

    // If resident, automatically use their society from profile
    if (role === "resident") {
      const resident = await Auth.findById(id);
      if (!resident || !resident.society) {
        return res
          .status(404)
          .json({ message: "Society not found for resident" });
      }
      targetSociety = resident.society;
    }

    if (!alertType || !description || !targetSociety) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emergency = await Emergency.create({
      alertType,
      description,
      society: targetSociety,
    });

    // Create persistent notifications for all users in this society
    const users = await Auth.find({
      $or: [
        { society: targetSociety },
        { selectSociety: { $in: [targetSociety] } }, // Handle admins managing multiple societies if needed
      ],
    });

    // We also need the society name if selectSociety uses names
    const societyDoc = await Society.findById(targetSociety);

    const targetUsers = await Auth.find({
      $or: [
        { society: targetSociety },
        { selectSociety: societyDoc?.societyName },
      ],
    });

    const notificationPromises = targetUsers.map((user: any) =>
      Notification.create({
        userId: user._id,
        title: "Emergency Alert",
        message: `Emergency: ${alertType}. ${description}`,
        type: "error",
        society: targetSociety,
      }),
    );

    await Promise.all(notificationPromises);

    const io = req.app.get("io");
    io.to(targetSociety.toString()).emit("notification", {
      title: " Alert",
      message: `${alertType}. ${description}`,
      type: "error",
    });

    return res
      .status(201)
      .json({ message: "Emergency created successfully", emergency });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getEmergency = async function (req: any, res: any) {
  try {
    const { role, id } = req.user;
    const { societyId } = req.query;
    let query: any = {};

    if (role === "admin") {
      if (societyId) {
        query.society = societyId;
      } else {
        const admin = await Auth.findById(id);
        if (
          !admin ||
          !admin.selectSociety ||
          admin.selectSociety.length === 0
        ) {
          return res.status(200).json({ emergency: [] });
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
        return res
          .status(404)
          .json({ message: "Society not found for resident" });
      }
      query.society = resident.society;
    }

    const emergency = await Emergency.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ emergency });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const deleteEmergency = async function (req: any, res: any) {
  try {
    const id = req.params.id;
    const emergency = await Emergency.findByIdAndDelete(id);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }
    const io = req.app.get("io");
    io.emit("notification", {
      title: "Emergency Deleted",
      message: `Emergency "${emergency.alertType}" has been removed.`,
      type: "warning",
    });
    return res
      .status(200)
      .json({ message: "Emergency deleted successfully", emergency });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { createEmergency, getEmergency, deleteEmergency };
