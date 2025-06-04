// // ./socket.js

// const jwt = require('jsonwebtoken');
// const User = require('../models/User'); 
// const Note = require('../models/Note');   
// const Chat = require('../models/Chat'); 

// const activeEditors = {};

// module.exports = function(io) {
//   io.use(async (socket, next) => {
//     const token = socket.handshake.auth.token; 
//     if (!token) {
//       return next(new Error('Authentication error: No token provided'));
//     }
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.userId).select('-password');
//       if (!user) {
//         return next(new Error('Authentication error: User not found'));
//       }
//       socket.user = user;
//       next();
//     } catch (err) {
//       console.error("Socket authentication error:", err.message);
//       next(new Error('Authentication error: Invalid token'));
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log(`User connected: ${socket.id}, UserID: ${socket.user.id}, Username: ${socket.user.username}`);

//     // Join a note room
//     socket.on('joinNoteRoom', async ({ noteId }) => {
//       try {
//         const note = await Note.findById(noteId);
//         if (!note) {
//           return socket.emit('error', { message: `Note with ID ${noteId} not found.` });
//         }

//         const userIdStr = socket.user.id.toString();
//         const isOwner = note.userId.toString() === userIdStr;
//         const isCollaborator = note.collaborators.map(c => c.toString()).includes(userIdStr);

//         if (!isOwner && !isCollaborator) {
//           return socket.emit('error', { message: 'You are not authorized to access this note.' });
//         }

//         socket.join(noteId);
//         console.log(`${socket.user.username} (Socket: ${socket.id}) joined room for note: ${noteId}`);
//         socket.emit('joinedNoteRoom', { noteId, message: `Successfully joined room for note ${noteId}` });

//         if (activeEditors[noteId]) {
//           socket.emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
//         } else {
//           socket.emit('editorUpdate', { noteId, editor: null });
//         }

//         const recentChats = await Chat.find({ noteId })
//           .sort({ timestamp: -1 })
//           .limit(50)
//           .populate('sender', 'username');
//         socket.emit('loadChatMessages', { noteId, messages: recentChats.reverse() });

//       } catch (error) {
//         console.error(`Error in joinNoteRoom for note ${noteId}:`, error);
//         socket.emit('error', { message: 'Server error while joining note room.' });
//       }
//     });

//     socket.on('leaveNoteRoom', ({ noteId }) => {
//       socket.leave(noteId);
//       console.log(`${socket.user.username} (Socket: ${socket.id}) left room for note: ${noteId}`);
//       if (activeEditors[noteId] && activeEditors[noteId].socketId === socket.id) {
//         console.log(`Editor ${activeEditors[noteId].username} left room, releasing lock for note ${noteId}.`);
//         delete activeEditors[noteId];
//         io.to(noteId).emit('editorUpdate', { noteId, editor: null });
//       }
//     });

//     socket.on('sendChatMessage', async ({ noteId, message }) => {
//       console.log(`Received sendChatMessage: noteId=${noteId}, message=${message}, from user=${socket.user.username}`);
//       if (!message || message.trim() === '') return;
//       try {
//         if (!socket.rooms.has(noteId)) {
//            return socket.emit('error', { message: 'You are not in the note room to send messages.' });
//         }

//         const chatMessage = new Chat({
//           noteId,
//           sender: socket.user.id,
//           message: message.trim(),
//         });
//         await chatMessage.save();

//         const populatedMessage = await Chat.findById(chatMessage._id).populate('sender', 'username email');

//         io.to(noteId).emit('newChatMessage', populatedMessage);
//       } catch (error) {
//         console.error('Error sending chat message:', error);
//         socket.emit('error', { message: 'Could not send message. Please try again.' });
//       }
//     });

//     socket.on('startEditing', ({ noteId }) => {
//       if (!activeEditors[noteId]) {
//         activeEditors[noteId] = {
//           userId: socket.user.id.toString(),
//           username: socket.user.username,
//           socketId: socket.id
//         };
//         io.to(noteId).emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
//         console.log(`${socket.user.username} (Socket: ${socket.id}) started editing note ${noteId}`);
//       } else if (activeEditors[noteId].socketId === socket.id) {
//         socket.emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
//       } else {
//         socket.emit('editingLocked', { noteId, editor: activeEditors[noteId] });
//       }
//     });

//     socket.on('noteContentChange', ({ noteId, content }) => {
//       if (activeEditors[noteId] && activeEditors[noteId].socketId === socket.id) {
//         socket.to(noteId).emit('receiveNoteContentChange', {
//             noteId,
//             content,
//             editorId: socket.user.id,
//             editorUsername: socket.user.username
//         });
//       } else {
//         socket.emit('error', { message: 'You do not have the editing lock for this note.' });
//         socket.emit('editorUpdate', { noteId, editor: activeEditors[noteId] });
//       }
//     });

//     socket.on('stopEditing', async ({ noteId, finalContent }) => {
//       if (activeEditors[noteId] && activeEditors[noteId].socketId === socket.id) {
//         const editorInfo = activeEditors[noteId];
//         delete activeEditors[noteId];
//         io.to(noteId).emit('editorUpdate', { noteId, editor: null });
//         console.log(`${editorInfo.username} (Socket: ${socket.id}) stopped editing note ${noteId}`);

//         try {
//           const note = await Note.findById(noteId);
//           if (!note) {
//              return socket.emit('error', { message: `Cannot save. Note ${noteId} not found.` });
//           }
//           const userIdStr = socket.user.id.toString();
//           const isOwner = note.userId.toString() === userIdStr;
//           const isCollaborator = note.collaborators.map(c => c.toString()).includes(userIdStr);

//           if(!isOwner && !isCollaborator) {
//             console.warn(`User ${socket.user.username} attempted to save note ${noteId} without authorization after releasing lock.`);
//             return socket.emit('error', { message: 'Unauthorized to save changes to this note.' });
//           }

//           note.content = finalContent;
//           await note.save();
//           io.to(noteId).emit('noteSaved', {
//             noteId,
//             updatedAt: note.updatedAt,
//             content: note.content,
//             savedBy: { userId: socket.user.id, username: socket.user.username }
//           });
//           console.log(`Note ${noteId} saved by ${editorInfo.username}`);
//         } catch (error) {
//           console.error(`Error saving note ${noteId} after editing:`, error);
//           socket.emit('error', { message: 'Failed to save note changes. Please try again or copy your changes.' });
//         }
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.id}, UserID: ${socket.user.id}, Username: ${socket.user.username}`);
//       for (const noteId in activeEditors) {
//         if (activeEditors[noteId].socketId === socket.id) {
//           const editorUsername = activeEditors[noteId].username;
//           console.log(`Editor ${editorUsername} (Socket: ${socket.id}) for note ${noteId} disconnected. Releasing lock.`);
//           delete activeEditors[noteId];
//           io.to(noteId).emit('editorUpdate', { noteId, editor: null });
//           break;
//         }
//       }
//     });
//   });
// };

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a note room
    socket.on('joinNoteRoom', ({ noteId }) => {
      socket.join(noteId);
      console.log(`User ${socket.id} joined room ${noteId}`);
      socket.emit('joinedNoteRoom', { noteId, message: `Joined room ${noteId}` });
    });

    // Broadcast note content changes to others in the room
    socket.on('noteContentChange', ({ noteId, content }) => {
      socket.to(noteId).emit('receiveNoteContentChange', { noteId, content });
    });

    // Broadcast chat messages to others in the room
    socket.on('sendChatMessage', ({ noteId, message }) => {
      io.to(noteId).emit('newChatMessage', { noteId, message, sender: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};