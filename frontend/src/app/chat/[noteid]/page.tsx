
"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { fetchNoteById } from '@/redux/notesSlice';
import { checkAuth } from '@/redux/authSlice';
import { initializeChat, leaveChat, sendMessage } from '@/redux/chatSlice';
import ChatMessages from '@/components/ChatMessages';

interface Note {
  _id: string;
  userId: string;
  collaborators: string[];
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const ChatPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { noteId } = useParams();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { currentNote, loading: notesLoading, error: notesError } = useSelector((state: RootState) => state.notes);
  const { connected, error: chatError } = useSelector((state: RootState) => state.chat);
  const [input, setInput] = React.useState('');

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(checkAuth());
      if (isAuthenticated && noteId) {
        await dispatch(fetchNoteById(noteId as string));
      } else {
        router.push('');
      }
    };
    fetchData();
  }, [noteId, isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (currentNote && noteId) {
      const userId = user?._id;
      if (!userId) {
        router.push('');
        return;
      }
      const userIdStr = userId.toString();
      const isOwner = currentNote.userId.toString() === userIdStr;
      const isCollaborator = currentNote.collaborators.map(c => c.toString()).includes(userIdStr);
      if (isOwner || isCollaborator) {
        dispatch(initializeChat(noteId as string));
      } else {
        router.push('/dashboard');
      }
    }
    return () => {
      if (noteId) {
        dispatch(leaveChat(noteId as string));
      }
    };
  }, [currentNote, dispatch, noteId, user, router]);

  const handleSend = () => {
    if (input.trim() && connected && noteId) {
        console.log(`Sending message: noteId=${noteId}, message=${input}`);
      dispatch(sendMessage(noteId as string, input));
      setInput('');
    }
  };

  const handleBack = () => {
    router.push(`/notes/${noteId}`);
  };

  if (notesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (notesError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error: {notesError}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleBack}>
          Back to Note
        </Button>
      </Box>
    );
  }

  if (!currentNote) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Note not found</Typography>
        <Button variant="contained" color="primary" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (chatError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6" gutterBottom>
          Chat Error: {chatError}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleBack}>
          Back to Note
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Chat for "{currentNote.title}"
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <ChatMessages />
        {!connected ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
            />
            <Button variant="contained" onClick={handleSend} disabled={!input.trim()}>
              Send
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
