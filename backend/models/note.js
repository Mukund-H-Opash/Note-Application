const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, 
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  tags: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

NoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Note = mongoose.model('Note', NoteSchema);
module.exports = Note;
