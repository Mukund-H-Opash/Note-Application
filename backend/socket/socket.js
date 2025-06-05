const Note = require("../models/note");

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a note room
    socket.on('joinNoteRoom', async ({ noteId, userId }) => {
      try {
        const note = await Note.findById(noteId);
        if (!note) {
          socket.emit('error', { message: 'Note not found.' });
          return;
        }
        const isCollaborator = note.collaborators.includes(userId) || note.userId.toString() === userId;
        if (!isCollaborator) {
          socket.emit('error', { message: 'You are not a collaborator of this note and cannot join the chat.' });
          return;
        }
        socket.join(noteId);
        socket.emit('joinedNoteRoom', { message: `Joined note room ${noteId}` });
      } catch (err) {
        console.error('Join room error:', err.message);
        socket.emit('error', { message: 'Failed to join chat room.' });
      }
    });

    // Broadcast chat messages to others in the room
    socket.on('sendChatMessage', ({ noteId, message, sender }) => {
      // console.log('Message received on server:', { noteId, message, sender }); 
      io.to(noteId).emit('newChatMessage', { noteId, message, sender }); 
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};