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
    const {societyId} = req.query;
    const targetSociety = req.user.society || societyId;
    const note = await Note.find({society:targetSociety});
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
