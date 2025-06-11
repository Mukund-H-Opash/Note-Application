// backend/routes/notesRoutes.js
const express = require("express");
const router = express.Router();
const { createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  toggleReadOnly, // Import new controller function [new]
} = require("../controllers/notesController");


const  authMiddleware = require('../middleware/authMiddleware');


router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.get("/:id", authMiddleware, getNoteById);


router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

router.put("/:id/read-only", authMiddleware, toggleReadOnly); 


module.exports = router;