const Note = require("../models/note.model");

const createDBNotifications = async (
  societyId: any,
  title: string,
  message: string,
  type: string,
) => {
  try {
    const Notification = require("../models/notification.model");
    const Auth = require("../models/auth.model");
    const Society = require("../models/society.model");

    if (!societyId) return;

    // Find the society name to map selectSociety for admins
    const societyDoc = await Society.findById(societyId);
    const societyName = societyDoc ? societyDoc.societyName : null;

    const query: any = {
      $or: [{ society: societyId }],
    };
    if (societyName) {
      query.$or.push({ selectSociety: { $in: [societyName] } });
    }

    const users = await Auth.find(query);

    const notificationsToCreate = users.map((user: any) => ({
      userId: user._id,
      title,
      message,
      type,
      society: societyId,
      status: "unread",
    }));

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }
  } catch (error) {
    console.error("Error creating database notifications:", error);
  }
};

const addNote = async (req: any, res: any) => {
  try {
    const { title, description, date, society } = req.body;
    if (!title || !description || !date || !society) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const note = await Note.create({
      title,
      description,
      date,
      society,
    });

    const io = req.app.get("io");
    io.emit("notification", {
      title: "New Note",
      message: `A new note "${note.title}" has been added.`,
      type: "success",
    });

    await createDBNotifications(
      society,
      "New Note",
      `A new note "${note.title}" has been added.`,
      "success",
    );

    return res.status(201).json({
      message: "Note added successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const editNote = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const { title, description, date } = req.body;
    const note = await Note.findByIdAndUpdate(
      id,
      {
        title,
        description,
        date,
      },
      { new: true },
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Note Updated",
      message: `Note "${note.title}" has been updated.`,
      type: "info",
    });

    await createDBNotifications(
      note.society,
      "Note Updated",
      `Note "${note.title}" has been updated.`,
      "info",
    );

    return res.status(200).json({
      message: "Note updated successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const deleteNote = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const note = await Note.findByIdAndDelete(id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const io = req.app.get("io");
    io.emit("notification", {
      title: "Note Deleted",
      message: `Note "${note.title}" has been removed.`,
      type: "warning",
    });

    await createDBNotifications(
      note.society,
      "Note Deleted",
      `Note "${note.title}" has been removed.`,
      "warning",
    );

    return res.status(200).json({
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

const getNote = async (req: any, res: any) => {
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
        return res
          .status(404)
          .json({ message: "Society not found for resident" });
      }
      query.society = resident.society;
    }

    const note = await Note.find(query)
      .select("-__v -updatedAt -society")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Note fetched successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { addNote, editNote, deleteNote, getNote };
