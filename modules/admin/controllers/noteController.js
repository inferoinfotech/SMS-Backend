const { Note } = require("../models");

exports.createNote = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const createdBy = req.admin._id;

    const society = req.society._id;

    const note = new Note({ title, date, description, society, createdBy, isDeleted: false });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ society: req.society._id, isDeleted: false })
      .populate('society')
      .populate('createdBy');

    if (notes.length === 0) {
      return res.status(404).json({ error: "No notes found" });
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, isDeleted: false, society: req.society._id, })
      .populate('society')
      .populate('createdBy');

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, date, description } = req.body;
    const society = req.society._id;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { title, date, description, society },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted", note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
