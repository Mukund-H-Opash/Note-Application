"use client";

import React from "react";
import { Box, Typography, Button } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import BookIcon from '@mui/icons-material/Book';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';

// Custom styled components for enhanced design
const SidebarContainer = styled(Box)({
  width: 250,
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e0e0e0',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  fontFamily: "'Inter', sans-serif",
  transition: 'all 0.3s ease-in-out',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
});

const NavButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textTransform: 'none',
  width: '100%',
  color: '#2d3748',
  fontSize: '0.95rem',
  fontWeight: 500,
  fontFamily: "'Inter', sans-serif",
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#f1f5f9',
    transform: 'translateX(4px)',
    color: theme.palette.primary.main,
    '& .MuiButton-startIcon': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiButton-startIcon': {
    marginRight: '12px',
    color: '#718096',
    transition: 'color 0.2s ease',
  },
}));

const NewNoteButton = styled(Button)(({ theme }) => ({
  width: '100%',
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 600,
  fontFamily: "'Poppins', sans-serif",
  padding: '12px 16px',
  borderRadius: '8px',
  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  color: '#ffffff',
  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-2px)',
  },
}));

const TitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  fontSize: '1.25rem',
  color: '#1a202c',
  marginBottom: '24px',
  letterSpacing: '-0.02em',
});

export default function Sidebar() {
  const router = useRouter();

  return (
    <>
      {/* Import Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <SidebarContainer>
        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1 }}>
          <TitleTypography variant="h6">
            All Notes
          </TitleTypography>
          <NavButton
            startIcon={<NotesIcon />}
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </NavButton>
          <NavButton
            startIcon={<BookIcon />}
            onClick={() => router.push('/notes')}
          >
            Notes
          </NavButton>
          {/* <NavButton
            startIcon={<ChatIcon />}
            onClick={() => router.push('/chat')}
          >
            Chat
          </NavButton> */}
          <NavButton
            startIcon={<PersonIcon />}
            onClick={() => router.push('/profile')}
          >
            Profile
          </NavButton>
        </Box>

        {/* Actions */}
        <Box>
          <NewNoteButton
            variant="contained"
            onClick={() => router.push('/notes/create')}
          >
            New Note
          </NewNoteButton>
        </Box>
      </SidebarContainer>
    </>
  );
}