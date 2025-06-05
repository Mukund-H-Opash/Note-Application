"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatMessage from '@/components/ChatMessages';
import { checkAuth } from '@/redux/authSlice';
import { initializeSocket, sendMessage, disconnectSocket } from '@/redux/chatSlice';

// Custom styled components
const MainContainer = styled(Box)({
  maxWidth: 900,
  margin: '32px auto',
  padding: '32px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  fontFamily: "'Inter', sans-serif",
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
});

const ChatCard = styled(Card)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  flexGrow: 1,
  maxHeight: '65vh',
  overflowY: 'auto',
  marginBottom: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
});

const TitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  fontSize: '1.5rem',
  color: '#1a202c',
  marginBottom: '16px',
});

const ErrorTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#dc2626',
  backgroundColor: '#fef2f2',
  padding: '12px',
  borderRadius: '8px',
  textAlign: 'center',
  marginBottom: '16px',
});

const ActionButton = styled(Button)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '0.9rem',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const ChatPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const noteId = params?.noteid ? (Array.isArray(params.noteid) ? params.noteid[0] : params.noteid) : null;
  const { isAuthenticated, user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { messages, connected, error } = useSelector((state: RootState) => state.chat);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialized = useRef(false); // Track initialization

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialized.current) return; // Prevent double initialization
    initialized.current = true;

    if (!noteId || typeof noteId !== 'string') {
      router.push('/dashboard');
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      try {
        await dispatch(checkAuth());
        if (!isAuthenticated || !user) {
          if (isMounted) router.push('/login');
          return;
        }
        dispatch(initializeSocket(noteId, user._id));
      } catch (err) {
        console.error('Fetch data error:', err);
        if (isMounted) router.push('/dashboard');
      }
    };
    fetchData();

    return () => {
      isMounted = false;
      dispatch(disconnectSocket());
      initialized.current = false;
    };
  }, [noteId, isAuthenticated, user, dispatch, router]);

  const handleSend = () => {
    if (input.trim() && user) {
      dispatch(sendMessage(noteId!, input, user._id));
      setInput('');
    }
  };

  const handleBack = () => {
    router.push(noteId ? `/notes/${noteId}` : '/dashboard');
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <MainContainer>
        <AppBar
          position="static"
          sx={{ bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', mb: 3 }}
        >
          <Toolbar>
            <IconButton edge="start" sx={{ color: '#1a202c' }} onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
            <TitleTypography sx={{ flexGrow: 1, textAlign: 'center' }}>
              Chat for Note {noteId}
            </TitleTypography>
          </Toolbar>
        </AppBar>
        {error && (
          <ErrorTypography>
            {error}
          </ErrorTypography>
        )}
        <ChatCard>
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            {messages.map((msg, idx) => (
              <ChatMessage
                key={idx}
                sender={msg.sender}
                message={msg.message}
                timestamp={msg.timestamp}
                isCurrentUser={msg.sender === user?._id}
              />
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
        </ChatCard>
        {!connected ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress sx={{ color: '#3b82f6' }} size={24} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, maxWidth: '600px', mx: 'auto' }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              inputProps={{ maxLength: 500 }}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '8px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#3b82f6' },
                },
              }}
            />
            <ActionButton
              variant="contained"
              onClick={handleSend}
              disabled={!input.trim()}
              sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
            >
              Send
            </ActionButton>
          </Box>
        )}
      </MainContainer>
    </>
  );
};

export default ChatPage;