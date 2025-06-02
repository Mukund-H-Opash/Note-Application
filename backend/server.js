const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const router = require('./routes/authRoutes');
const noteRouter = require('./routes/notesRoutes');
const adminRouter = require('./routes/adminRoutes');
const { connectDB } = require('./dbconfig/db');
const cors = require('cors');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  }
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/notes', noteRouter);
app.use('/admin', adminRouter);
app.use('/auth', router);

connectDB();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// --- Socket.IO logic for real-time note collaboration ---
const activeEditors = {};

io.on('connection', (socket) => {
  // Join a note room
  socket.on('joinNote', ({ noteId, user }) => {
    socket.join(noteId);
    if (!activeEditors[noteId]) activeEditors[noteId] = [];
    if (!activeEditors[noteId].includes(user)) activeEditors[noteId].push(user);

    io.to(noteId).emit('activeEditors', activeEditors[noteId]);
  });

  // Handle note changes
  socket.on('editNote', ({ noteId, content }) => {
    socket.to(noteId).emit('noteUpdated', content);
  });

  // Leave note room
  socket.on('leaveNote', ({ noteId, user }) => {
    socket.leave(noteId);
    if (activeEditors[noteId]) {
      activeEditors[noteId] = activeEditors[noteId].filter(u => u !== user);
      io.to(noteId).emit('activeEditors', activeEditors[noteId]);
    }
  });

  // On disconnect, remove user from all rooms
  socket.on('disconnecting', () => {
    for (const noteId of socket.rooms) {
      if (activeEditors[noteId]) {
        activeEditors[noteId] = activeEditors[noteId].filter(u => u !== socket.id);
        io.to(noteId).emit('activeEditors', activeEditors[noteId]);
      }
    }
  });
});