const Note = require("../models/note.model");

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

    return res.status(201).json({
      message: "Note added successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error: " + error.message });
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

    return res.status(200).json({
      message: "Note updated successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error: " + error.message });
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

    return res.status(200).json({
      message: "Note deleted successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error: " + error.message });
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

    const note = await Note.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Note fetched successfully",
      data: note,
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error: " + error.message });
  }
};

module.exports = { addNote, editNote, deleteNote, getNote };
