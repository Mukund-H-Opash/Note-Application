const Note = require("../models/note");

// Create a new note
const createNote = async (req, res) => {
  try {
    const { title, content, tags, collaborators } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = await Note.create({
      title,
      content,
      tags,
      userId: req.user._id,
      collaborators: collaborators || [],
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all notes for current user (owner or collaborator)
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { userId: req.user._id },
        { collaborators: req.user._id }
      ]
    }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update a note (only if owner or collaborator)
const updateNote = async (req, res) => {
  try {
    const { title, content, tags, collaborators } = req.body;
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags || note.tags;
    if (collaborators) note.collaborators = collaborators;

    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete a note (only if owner)
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
