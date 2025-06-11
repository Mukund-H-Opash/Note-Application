// frontend/src/app/notes/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter, useParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Fade,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { fetchNoteById, fetchCollaborators, toggleNoteReadOnly } from "@/redux/notesSlice";
import { initializeSocket, disconnectSocket, emitTypingNote, emitStoppedTypingNote } from '@/redux/chatSlice';
import Loader from "@/components/Loader"; 


interface Note {
  _id: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  collaborators: string[];
  title: string;
  content: string;
  tags: string[];
  readOnly: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: string;
  __v: number;
}

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
});

const StyledCard = styled(Card)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
  },
});

const TitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  fontSize: '2rem',
  color: '#1a202c',
  marginBottom: '16px',
  letterSpacing: '-0.02em',
});

const ContentTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  color: '#2d3748',
  marginBottom: '24px',
  lineHeight: 1.6,
});

const MetaTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#718096',
  marginBottom: '8px',
});

const SectionTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  fontSize: '1.25rem',
  color: '#1a202c',
  marginBottom: '16px',
  marginTop: '24px',
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

const StyledChip = styled(Chip)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 500,
  borderRadius: '6px',
  backgroundColor: '#dbeafe',
  color: theme.palette.primary.main,
  border: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#bfdbfe',
    transform: 'scale(1.05)',
  },
}));

const StyledList = styled(List)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
});

const StyledListItem = styled(ListItem)({
  borderBottom: '1px solid #e5e7eb',
  padding: '12px 16px',
  transition: 'background-color 0.2s ease',
  '&:last-child': { borderBottom: 'none' },
  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
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

const NotePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { id } = useParams();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { currentNote, collaborators, loading, error } = useSelector((state: RootState) => state.notes);
  const { activeNoteUsers } = useSelector((state: RootState) => state.chat);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated && id) {
          await dispatch(fetchNoteById(id as string));
        } else if (!isAuthenticated) {
          router.push("/login");
        }
      } catch (err) {
        console.error('Fetch note error:', err);
      }
    };
    fetchData();
  }, [id, isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (currentNote && currentNote.collaborators.length > 0) {
      dispatch(fetchCollaborators(currentNote.collaborators));
    }
  }, [currentNote, dispatch]);

  useEffect(() => {
    if (currentNote && user) {
      dispatch(initializeSocket(currentNote._id, user._id, user.username));
    }

    return () => {
      dispatch(disconnectSocket());
    };
  }, [currentNote, user, dispatch]);


  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (currentNote && user) {
      if (!isTyping) {
        dispatch(emitTypingNote(currentNote._id, user._id));
        setIsTyping(true);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        dispatch(emitStoppedTypingNote(currentNote._id, user._id));
        setIsTyping(false);
      }, 1500); // Stop typing after 1.5 seconds of inactivity
    }
  };


  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleEdit = () => {
    router.push(`/notes/edit/${id}`);
  };

  const handleToggleReadOnly = async () => {
    if (currentNote && user && currentNote.userId._id === user._id) {
      await dispatch(toggleNoteReadOnly(currentNote._id, !currentNote.readOnly));
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: '#f8fafc' }}>
        <Loader /> {/* Replaced CircularProgress with custom Loader [modified] */}
      </Box>
    );
  }

  if (error) {
    return (
      <MainContainer>
        <ErrorTypography variant="h6">
          Error: {error}
        </ErrorTypography>
        <ActionButton
          variant="contained"
          sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
          onClick={handleBack}
        >
          Back to Dashboard
        </ActionButton>
      </MainContainer>
    );
  }

  if (!currentNote) {
    return (
      <MainContainer>
        <ErrorTypography variant="h6">
          Note not found
        </ErrorTypography>
        <ActionButton
          variant="contained"
          sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
          onClick={handleBack}
        >
          Back to Dashboard
        </ActionButton>
      </MainContainer>
    );
  }

  const isOwner = user ? currentNote.userId._id === user._id : false;
  const isCollaborator = user ? currentNote.collaborators.includes(user._id) : false;
  const canAccessChat = isOwner || isCollaborator;

  const otherActiveUsers = activeNoteUsers.filter(activeUser => activeUser.userId !== user?._id);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <Head>
        <title>{currentNote.title}</title>
      </Head>
      <Fade in timeout={500}>
        <MainContainer>
          <StyledCard>
            <CardContent sx={{ padding: '24px' }}>
              <TitleTypography variant="h4">
                {currentNote.title}
              </TitleTypography>
              <ContentTypography variant="body1" onInput={handleContentChange}>
                {currentNote.content}
              </ContentTypography>
              <MetaTypography variant="body2">
                Author: {currentNote.userId.username}
              </MetaTypography>
              <MetaTypography variant="body2">
                Created: {new Date(currentNote.createdAt).toISOString().split("T")[0]}
              </MetaTypography>
              <MetaTypography variant="body2">
                Updated: {new Date(currentNote.updatedAt).toISOString().split("T")[0]}
              </MetaTypography>
              <MetaTypography variant="body2">
                Status: {currentNote.readOnly ? 'Read-Only' : 'Editable'}
              </MetaTypography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2, mb: 2 }}>
                {currentNote.tags.map((tag) => (
                  <StyledChip key={tag} label={tag} variant="filled" size="small" />
                ))}
              </Box>
            </CardContent>
          </StyledCard>

          <SectionTypography variant="h6">
            Collaborators
          </SectionTypography>
          {collaborators.length === 0 ? (
            <MetaTypography>No collaborators found</MetaTypography>
          ) : (
            <StyledList>
              {collaborators.map((user) => (
                <StyledListItem key={user._id}>
                  <ListItemText
                    primary={user.username}
                    secondary={user.email}
                    primaryTypographyProps={{ fontWeight: 500, color: '#2d3748' }}
                    secondaryTypographyProps={{ color: '#718096' }}
                  />
                </StyledListItem>
              ))}
            </StyledList>
          )}

          {otherActiveUsers.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: '8px' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Live on this note:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {otherActiveUsers.map(activeUser => (
                  <Chip
                    key={activeUser.userId}
                    label={`${activeUser.username} ${activeUser.isTyping ? '(typing...)' : '(viewing)'}`}
                    variant="outlined"
                    size="small"
                    color={activeUser.isTyping ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 4, display: "flex", gap: 2, flexWrap: 'wrap' }}>
            <ActionButton
              variant="contained"
              sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
              onClick={handleEdit}
            >
              Edit Note
            </ActionButton>
            {isOwner && (
              <ActionButton
                variant="outlined"
                sx={{
                  borderColor: currentNote.readOnly ? '#10b981' : '#f97316',
                  color: currentNote.readOnly ? '#10b981' : '#f97316',
                  '&:hover': {
                    borderColor: currentNote.readOnly ? '#059669' : '#ea580c',
                    color: currentNote.readOnly ? '#059669' : '#ea580c',
                    backgroundColor: currentNote.readOnly ? '#d1fae5' : '#fff7ed',
                  },
                }}
                onClick={handleToggleReadOnly}
              >
                {currentNote.readOnly ? 'Make Editable' : 'Make Read-Only'}
              </ActionButton>
            )}
            <ActionButton
              variant="contained"
              sx={{ background: 'linear-gradient(90deg, #6b7280, #9ca3af)' }}
              onClick={handleBack}
            >
              Back to Dashboard
            </ActionButton>
            {canAccessChat && (
              <ActionButton
                variant="contained"
                sx={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
                onClick={() => router.push(`/chat/${id}`)}
              >
                Open Chat
              </ActionButton>
            )}
          </Box>
        </MainContainer>
      </Fade>
    </>
  );
};

export default NotePage;