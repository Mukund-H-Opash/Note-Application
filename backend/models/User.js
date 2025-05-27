const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    enum: ['User', 'Admin'],
    default: ['User'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', UserSchema);


module.exports = User;