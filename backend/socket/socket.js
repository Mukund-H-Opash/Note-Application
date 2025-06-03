// ./socket.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as per your project structure
const Note = require('../models/Note');   // Adjust path
const Chat = require('../models/Chat');   // Adjust path

// To keep track of who is currently editing which note
// Structure: { noteId: { userId: 'editingUserId', username: 'editorUsername', socketId: 'editorsSocketId' } }
const activeEditors = {};

module.exports = function(io) {
  // Socket.IO Authentication Middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token; // Client should send token here
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password'); // Exclude password
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      socket.user = user; // Attach user object to the socket instance
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}, UserID: ${socket.user.id}, Username: ${socket.user.username}`);

    /**
     * Handles a user joining a specific note's room.
     */
    socket.on('joinNoteRoom', async ({ noteId }) => {
      try {
        const note = await Note.findById(noteId);
        if (!note) {
          return socket.emit('error', { message: `Note with ID ${noteId} not found.` });
        }

        const userIdStr = socket.user.id.toString();
        const isOwner = note.userId.toString() === userIdStr;
        const isCollaborator = note.collaborators.map(c => c.toString()).includes(userIdStr);

        if (!isOwner && !isCollaborator) {
          return socket.emit('error', { message: 'You are not authorized to access this note.' });
        }

        socket.join(noteId);
        console.log(`${socket.user.username} (Socket: ${socket.id}) joined room for note: ${noteId}`);
        socket.emit('joinedNoteRoom', { noteId, message: `Successfully joined room for note ${noteId}` });

        // Send current editor status for this note
        if (activeEditors[noteId]) {
          socket.emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
        } else {
          socket.emit('editorUpdate', { noteId, editor: null }); // Explicitly send null if no editor
        }

        // Load and send recent chat messages
        const recentChats = await Chat.find({ noteId })
          .sort({ timestamp: -1 })
          .limit(50) // Send last 50 messages
          .populate('sender', 'username'); // Populate sender's username
        socket.emit('loadChatMessages', { noteId, messages: recentChats.reverse() });

      } catch (error) {
        console.error(`Error in joinNoteRoom for note ${noteId}:`, error);
        socket.emit('error', { message: 'Server error while joining note room.' });
      }
    });

    /**
     * Handles a user leaving a specific note's room.
     */
    socket.on('leaveNoteRoom', ({ noteId }) => {
      socket.leave(noteId);
      console.log(`${socket.user.username} (Socket: ${socket.id}) left room for note: ${noteId}`);
      // If this user was the active editor, release the lock
      if (activeEditors[noteId] && activeEditors[noteId].socketId === socket.id) {
        console.log(`Editor ${activeEditors[noteId].username} left room, releasing lock for note ${noteId}.`);
        delete activeEditors[noteId];
        io.to(noteId).emit('editorUpdate', { noteId, editor: null });
      }
    });

    /**
     * Handles incoming chat messages for a note.
     */
    socket.on('sendChatMessage', async ({ noteId, message }) => {
      if (!message || message.trim() === '') return; // Ignore empty messages
      try {
        // Ensure user is still in the room (though client logic should handle this)
        if (!socket.rooms.has(noteId)) {
           return socket.emit('error', { message: 'You are not in the note room to send messages.' });
        }

        const chatMessage = new Chat({
          noteId,
          sender: socket.user.id,
          message: message.trim(),
        });
        await chatMessage.save();

        // Populate sender details before broadcasting
        const populatedMessage = await Chat.findById(chatMessage._id).populate('sender', 'username email');

        io.to(noteId).emit('newChatMessage', populatedMessage);
      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Could not send message. Please try again.' });
      }
    });

    /**
     * Handles a user's request to start editing a note.
     */
    socket.on('startEditing', ({ noteId }) => {
      if (!activeEditors[noteId]) {
        activeEditors[noteId] = {
          userId: socket.user.id.toString(),
          username: socket.user.username,
          socketId: socket.id
        };
        io.to(noteId).emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
        console.log(`${socket.user.username} (Socket: ${socket.id}) started editing note ${noteId}`);
      } else if (activeEditors[noteId].socketId === socket.id) {
        // User might re-affirm, send current status back to them
        socket.emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
      } else {
        // Note is already being edited by someone else
        socket.emit('editingLocked', { noteId, editor: activeEditors[noteId] });
      }
    });

    /**
     * Handles real-time content changes from the active editor.
     */
    socket.on('noteContentChange', ({ noteId, content }) => {
      if (activeEditors[noteId] && activeEditors[noteId].socketId === socket.id) {
        // Broadcast content changes to other users in the room (excluding the sender)
        socket.to(noteId).emit('receiveNoteContentChange', {
            noteId,
            content,
            editorId: socket.user.id,
            editorUsername: socket.user.username
        });
      } else {
        // If a non-editor tries to send changes, inform them they don't have the lock
        socket.emit('error', { message: 'You do not have the editing lock for this note.' });
        // Optionally, re-send the current editor status
        socket.emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
      }
    });

    /**
     * Handles a user stopping editing and saving the final content.
     */
    socket.on('stopEditing', async ({ noteId, finalContent }) => {
      if (activeEditors[noteId] && activeEditors[noteId].socketId === socket.id) {
        const editorInfo = activeEditors[noteId]; // Store before deleting
        delete activeEditors[noteId];
        io.to(noteId).emit('editorUpdate', { noteId, editor: null }); // Notify editor is free
        console.log(`${editorInfo.username} (Socket: ${socket.id}) stopped editing note ${noteId}`);

        // Save the final content to the database
        try {
          const note = await Note.findById(noteId);
          if (!note) {
             return socket.emit('error', { message: `Cannot save. Note ${noteId} not found.` });
          }
          // Double-check authorization before saving (owner or collaborator)
          const userIdStr = socket.user.id.toString();
          const isOwner = note.userId.toString() === userIdStr;
          const isCollaborator = note.collaborators.map(c => c.toString()).includes(userIdStr);

          if(!isOwner && !isCollaborator) {
            console.warn(`User ${socket.user.username} attempted to save note ${noteId} without authorization after releasing lock.`);
            return socket.emit('error', { message: 'Unauthorized to save changes to this note.' });
          }

          note.content = finalContent;
          // note.updatedAt will be set by the pre-save hook
          await note.save();
          io.to(noteId).emit('noteSaved', {
            noteId,
            updatedAt: note.updatedAt,
            content: note.content,
            savedBy: { userId: socket.user.id, username: socket.user.username }
          });
          console.log(`Note ${noteId} saved by ${editorInfo.username}`);
        } catch (error) {
          console.error(`Error saving note ${noteId} after editing:`, error);
          // Inform the user who was editing about the save failure
          socket.emit('error', { message: 'Failed to save note changes. Please try again or copy your changes.' });
          // Optionally, inform others in the room about the save failure too
          // socket.to(noteId).emit('noteSaveError', { noteId, message: 'Changes by the last editor could not be saved.' });
        }
      }
    });

    /**
     * Handles user disconnection.
     */
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.id}, Username: ${socket.user.username}`);
      // Clean up active editor status if the disconnected user was editing any note
      for (const noteId in activeEditors) {
        if (activeEditors[noteId].socketId === socket.id) {
          const editorUsername = activeEditors[noteId].username;
          console.log(`Editor ${editorUsername} (Socket: ${socket.id}) for note ${noteId} disconnected. Releasing lock.`);
          delete activeEditors[noteId];
          io.to(noteId).emit('editorUpdate', { noteId, editor: null });
          // You might want to add logic here to handle unsaved changes if the editor disconnects abruptly.
          // For example, emit an event like 'editorDisconnectedWithUnsavedChanges'.
          // The application would then need a strategy to recover/notify.
          break; // Assuming a user can only edit one note at a time
        }
      }
    });
  });
};