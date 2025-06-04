const express = require("express");
const router = express.Router();
const { createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,} = require("../controllers/notesController");


const  authMiddleware = require('../middleware/authMiddleware');


router.post("/", authMiddleware, createNote);
router.get("/", authMiddleware, getNotes);
router.get("/:id", authMiddleware, getNoteById);


router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);


module.exports = router;
