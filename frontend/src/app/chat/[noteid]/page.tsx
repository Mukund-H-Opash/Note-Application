
// "use client";

// import React, { useEffect, useState, useCallback } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { useSelector, useDispatch } from 'react-redux';
// import type { RootState, AppDispatch } from '@/redux/store';
// import {
//   Box,
//   Typography,
//   Button,
//   CircularProgress,
//   TextField,
//   Paper,
//   AppBar,
//   Toolbar,
//   IconButton,
//   Alert,
// } from '@mui/material';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import { fetchNoteById } from '@/redux/notesSlice';
// import { checkAuth } from '@/redux/authSlice';
// import { initializeChat, leaveChat, sendMessage, disconnectSocket } from '@/redux/chatSlice';
// import ChatMessages from '@/components/ChatMessages';

// interface Note {
//   _id: string;
//   userId: string;
//   collaborators: string[];
//   title: string;
//   content: string;
//   tags: string[];
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// }

// const ChatPage = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const router = useRouter();
//   const { noteId } = useParams();
//   const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
//   const { currentNote, loading: notesLoading, error: notesError } = useSelector((state: RootState) => state.notes);
//   const { connected, error: chatError, socket } = useSelector((state: RootState) => state.chat);
//   const [input, setInput] = useState('');
//   const [retryCount, setRetryCount] = useState(0);
//   const maxRetries = 3;

//   // Validate noteId
//   // const isValidNoteId = noteId && typeof noteId === 'string' && noteId.match(/^[0-9a-fA-F]{24}$/);

//   // Handle reconnection attempt
//   const attemptReconnect = useCallback(() => {
//     if (retryCount < maxRetries && noteId && currentNote) {
//       setRetryCount(retryCount + 1);
//       dispatch(initializeChat(noteId as string));
//       console.log(`Attempting reconnect (${retryCount + 1}/${maxRetries})...`);
//     } else if (retryCount >= maxRetries) {
//       console.log('Max retry attempts reached. Please refresh the page.');
//     }
//   }, [retryCount, noteId, currentNote, dispatch]);

//   // useEffect(() => {
//     // if (!isValidNoteId) {
//     //   router.push('');
//     //   return;
//     // }

//   //   const fetchData = async () => {
//   //     try {
//   //       await dispatch(checkAuth());
//   //       if (!isAuthenticated || !noteId) {
//   //         router.push('/login');
//   //         return;
//   //       }
//   //       await dispatch(fetchNoteById(noteId as string));
//   //     } catch (err) {
//   //       console.error('Fetch data error:', err);
//   //       router.push('/dashboard');
//   //     }
//   //   };
//   //   fetchData();
//   // }, [noteId, isAuthenticated, dispatch, router, isValidNoteId]);

//   // useEffect(() => {
//   //   if (currentNote && noteId && isValidNoteId) {
//   //     const userId = user?._id;
//   //     if (!userId) {
//   //       router.push('/login');
//   //       return;
//   //     }
//   //     const userIdStr = userId.toString();
//   //     const isOwner = currentNote.userId.toString() === userIdStr;
//   //     const isCollaborator = currentNote.collaborators.map(c => c.toString()).includes(userIdStr);
//   //     if (!isOwner && !isCollaborator) {
//   //       router.push('/dashboard');
//   //       return;
//   //     }
//   //     dispatch(initializeChat(noteId as string));
//   //   }
//   //   return () => {
//   //     if (noteId && socket) {
//   //       dispatch(leaveChat(noteId as string));
//   //       dispatch(disconnectSocket()); // Explicitly disconnect on unmount
//   //     }
//   //   };
//   // }, [currentNote, noteId, user, dispatch, router, isValidNoteId, socket]);

//   // const handleSend = () => {
//   //   if (!input.trim()) {
//   //     console.log('Empty message ignored');
//   //     return;
//   //   }
//   //   if (input.length > 500) { // Arbitrary max length to prevent abuse
//   //     console.log('Message too long (max 500 characters)');
//   //     return;
//   //   }
//   //   if (connected && noteId && isValidNoteId) {
//   //     console.log(`Sending message: noteId=${noteId}, message=${input}`);
//   //     dispatch(sendMessage(noteId as string, input));
//   //     setInput('');
//   //   } else {
//   //     console.log('Cannot send message: Not connected or invalid noteId');
//   //     attemptReconnect();
//   //   }
//   // };

//   // const handleBack = () => {
//   //   if (noteId && isValidNoteId) {
//   //     router.push(`/notes/${noteId}`);
//   //   } else {
//   //     router.push('/dashboard');
//   //   }
//   // };

//   // Handle WebSocket disconnect or error
//   useEffect(() => {
//     if (chatError && retryCount < maxRetries) {
//       attemptReconnect();
//     }
//   }, [chatError, retryCount, attemptReconnect]);

//   if (notesLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//         <CircularProgress color="primary" />
//       </Box>
//     );
//   }

//   // if (!isValidNoteId) {
//   //   return (
//   //     <Box sx={{ p: 3, textAlign: 'center' }}>
//   //       <Typography color="error" variant="h6" gutterBottom>
//   //         Invalid Note ID
//   //       </Typography>
//   //       <Button variant="contained" color="primary" onClick={() => router.push('/dashboard')}>
//   //         Back to Dashboard
//   //       </Button>
//   //     </Box>
//   //   );
//   // }

//   // if (notesError) {
//   //   return (
//   //     <Box sx={{ p: 3, textAlign: 'center' }}>
//   //       <Typography color="error" variant="h6" gutterBottom>
//   //         Error: {notesError}
//   //       </Typography>
//   //       <Button variant="contained" color="primary" onClick={handleBack}>
//   //         Back to Note
//   //       </Button>
//   //     </Box>
//   //   );
//   }

//   // if (!currentNote) {
//   //   return (
//   //     <Box sx={{ p: 3, textAlign: 'center' }}>
//   //       <Typography variant="h6">Note not found</Typography>
//   //       <Button variant="contained" color="primary" onClick={() => router.push('/dashboard')}>
//   //         Back to Dashboard
//   //       </Button>
//   //     </Box>
//   //   );
//   // }

//   // if (chatError) {
//   //   return (
//   //     <Box sx={{ p: 3, textAlign: 'center' }}>
//   //       <Alert severity="error">
//   //         Chat Error: {chatError}
//   //         {retryCount < maxRetries ? (
//   //           <Button variant="text" onClick={attemptReconnect} sx={{ ml: 1 }}>
//   //             Retry
//   //           </Button>
//   //         ) : (
//   //           <Typography variant="body2" sx={{ ml: 1 }}>
//   //             Max retries reached. Please refresh or try later.
//   //           </Typography>
//   //         )}
//   //       </Alert>
//   //       <Button variant="contained" color="primary" onClick={handleBack} sx={{ mt: 2 }}>
//   //         Back to Note
//   //       </Button>
//   //     </Box>
//   //   );
//   // }

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
//       <AppBar position="static">
//         <Toolbar>
//           <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
//             <ArrowBackIcon />
//           </IconButton>
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             Chat for "{currentNote.title}"
//           </Typography>
//         </Toolbar>
//       </AppBar>
//       <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
//         <ChatMessages />
//         {!connected ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center' }}>
//             <CircularProgress />
//             <Button variant="text" onClick={attemptReconnect} sx={{ ml: 2 }}>
//               Reconnect
//             </Button>
//           </Box>
//         ) : (
//           <Paper sx={{ p: 2, display: 'flex', gap: 1 }}>
//             <TextField
//               fullWidth
//               size="small"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//               placeholder="Type a message..."
//               inputProps={{ maxLength: 500 }}
//             />
//             <Button variant="contained" onClick={handleSend} disabled={!input.trim()}>
//               Send
//             </Button>
//           </Paper>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default ChatPage;

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Box, Typography, Button, TextField, Paper } from "@mui/material";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Change if needed

const ChatPage = () => {
  const router = useRouter();
  const { noteId } = useParams();
  const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // if (!noteId || typeof noteId !== "string") {
    //   router.push("/dashboard");
    //   return;
    // }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("joinNoteRoom", { noteId });

    socket.on("joinedNoteRoom", (data) => {
      setMessages((msgs) => [...msgs, { sender: "system", message: data.message }]);
    });

    socket.on("newChatMessage", (data) => {
      setMessages((msgs) => [...msgs, { sender: data.sender, message: data.message }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [noteId, router]);

  const handleSend = () => {
    if (!input.trim()) return;
    socketRef.current.emit("sendChatMessage", { noteId, message: input });
    setMessages((msgs) => [...msgs, { sender: "me", message: input }]);
    setInput("");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Simple Chat for Note {noteId}
      </Typography>
      <Paper sx={{ minHeight: 300, maxHeight: 400, overflowY: "auto", mb: 2, p: 2 }}>
        {messages.map((msg, idx) => (
          <Typography key={idx} color={msg.sender === "me" ? "primary" : "text.secondary"}>
            <b>{msg.sender}:</b> {msg.message}
          </Typography>
        ))}
      </Paper>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
        />
        <Button variant="contained" onClick={handleSend} disabled={!input.trim()}>
          Send
        </Button>
      </Box>
      <Button sx={{ mt: 2 }} onClick={() => router.push(`/notes/${noteId}`)}>
        Back to Note
      </Button>
    </Box>
  );
};

export default ChatPage;