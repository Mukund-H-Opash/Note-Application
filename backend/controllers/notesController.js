// backend/controllers/notesController.js
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
    })
    .populate('userId', 'username email')
    .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('userId', 'username email');
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

    // Only allow owner to change collaborators
    if (collaborators && note.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Only the note owner can manage collaborators" });
    }

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

// Toggle readOnly status of a note (only if owner) [new]
const toggleReadOnly = async (req, res) => {
  try {
    const { id } = req.params;
    const { readOnly } = req.body; // Expecting { readOnly: true/false }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Ensure only the owner can toggle readOnly status
    if (note.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied: Only the owner can change read-only status" });
    }

    note.readOnly = readOnly;
    await note.save();

    res.json(note);
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
  toggleReadOnly, 
};