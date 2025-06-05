
module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a note room
    socket.on('joinNoteRoom', ({ noteId, }) => {
      socket.join(noteId);
      socket.emit('joinedNoteRoom', { noteId, message: `Joined room ${noteId}` });
    });

    // // Broadcast note content changes to others in the room
    // socket.on('noteContentChange', ({ noteId, content }) => {
    //   socket.to(noteId).emit('receiveNoteContentChange', { noteId, content });
    // });

    // Broadcast chat messages to others in the room
    socket.on('sendChatMessage', ({ noteId, message }) => {
      io.to(noteId).emit('newChatMessage', { noteId, message, sender: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};