// backend/socket/socket.js
const Note = require("../models/note");

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Track which notes users are currently viewing/typing in
    const usersInNoteRooms = new Map(); // Map: noteId -> Map: userId -> { socketId, username, isTyping }

    // Helper to broadcast presence updates
    const broadcastNotePresence = (noteId) => {
        if (!usersInNoteRooms.has(noteId)) {
            return;
        }
        const activeUsersInRoom = Array.from(usersInNoteRooms.get(noteId).values()).map(user => ({
            userId: user.userId,
            username: user.username,
            isTyping: user.isTyping || false,
            socketId: user.socketId // Include socketId for tracking purposes (optional, can be removed for privacy)
        }));
        io.to(noteId).emit('notePresenceUpdate', { noteId, users: activeUsersInRoom });
    };


    // Join a note room
    socket.on('joinNoteRoom', async ({ noteId, userId, username }) => { // Added username to join event [new]
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

        // Add user to presence tracking for this note [new]
        if (!usersInNoteRooms.has(noteId)) {
            usersInNoteRooms.set(noteId, new Map());
        }
        usersInNoteRooms.get(noteId).set(userId, { socketId: socket.id, userId, username, isTyping: false });

        socket.emit('joinedNoteRoom', { message: `Joined note room ${noteId}` });
        broadcastNotePresence(noteId); // Broadcast initial presence [new]

      } catch (err) {
        console.error('Join room error:', err.message);
        socket.emit('error', { message: 'Failed to join chat room.' });
      }
    });

    // Handle typing status for notes (not just chat) [new]
    socket.on('typingNote', ({ noteId, userId }) => {
      const roomUsers = usersInNoteRooms.get(noteId);
      if (roomUsers && roomUsers.has(userId)) {
          roomUsers.get(userId).isTyping = true;
          broadcastNotePresence(noteId);
      }
    });

    socket.on('stoppedTypingNote', ({ noteId, userId }) => {
        const roomUsers = usersInNoteRooms.get(noteId);
        if (roomUsers && roomUsers.has(userId)) {
            roomUsers.get(userId).isTyping = false;
            broadcastNotePresence(noteId);
        }
    });


    // Broadcast chat messages to others in the room
    socket.on('sendChatMessage', ({ noteId, message, sender }) => {
      io.to(noteId).emit('newChatMessage', { noteId, message, sender }); 
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Remove user from all note room presence tracking [new]
      for (const [noteId, usersMap] of usersInNoteRooms.entries()) {
          let foundUser = false;
          for (const [userId, userData] of usersMap.entries()) {
              if (userData.socketId === socket.id) {
                  usersMap.delete(userId);
                  foundUser = true;
                  break;
              }
          }
          if (foundUser) {
              if (usersMap.size === 0) {
                  usersInNoteRooms.delete(noteId); // Clean up empty rooms
              } else {
                  broadcastNotePresence(noteId); // Broadcast updated presence
              }
              break; // A socket is usually only in one note room context for editing/typing
          }
      }
    });
  });
};