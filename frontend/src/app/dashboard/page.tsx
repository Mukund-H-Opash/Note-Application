// frontend/src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { styled } from '@mui/material/styles';
import type { RootState, AppDispatch } from "@/redux/store";
import { fetchUsers } from "@/redux/adminSlice";
import { fetchNotes } from "@/redux/notesSlice";
import Loader from "@/components/Loader"; // Import the custom Loader [new]


interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: string;
  __v: number;
}

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
  readOnly: boolean; // Add readOnly to the interface [modified]
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Custom styled components
const MainContainer = styled(Box)({
  flexGrow: 1,
  padding: '32px',
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  fontFamily: "'Inter', sans-serif",
});

const TitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  fontSize: '1.75rem',
  color: '#1a202c',
  marginBottom: '24px',
  letterSpacing: '-0.02em',
});

const SectionTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  fontSize: '1.25rem',
  color: '#1a202c',
  marginBottom: '16px',
  marginTop: '32px',
});

const ErrorTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#dc2626',
  marginBottom: '16px',
  backgroundColor: '#fef2f2',
  padding: '12px',
  borderRadius: '8px',
});

const StyledTable = styled(Table)({
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  overflow: 'hidden',
  '& .MuiTableCell-head': {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    color: '#1a202c',
    backgroundColor: '#f1f5f9',
    padding: '16px',
    fontSize: '0.95rem',
  },
  '& .MuiTableCell-body': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.9rem',
    color: '#2d3748',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
});

const ActionButton = styled(Button)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '0.9rem',
  textTransform: 'none',
  color: '#ffffff',
  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  borderRadius: '8px',
  padding: '8px 16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-2px)',
  },
}));

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const users = useSelector((state: RootState) => state.admin.users);
  const adminError = useSelector((state: RootState) => state.admin.error);
  const notes = useSelector((state: RootState) => state.notes.notes);
  const notesLoading = useSelector((state: RootState) => state.notes.loading); // Get specific loading states [new]
  const adminLoading = useSelector((state: RootState) => state.admin.loading);
  const notesError = useSelector((state: RootState) => state.notes.error);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUsers());
      dispatch(fetchNotes());
    }
  }, [dispatch, isAuthenticated]);

  const handleNoteClick = (id: string) => {
    router.push(`/notes/${id}`);
  };

  const isAdmin = user?.roles?.includes("Admin");

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <Box sx={{ display: "flex" }}> {/* This flex container ensures Sidebar and MainContainer sit side-by-side */}
        <Sidebar /> {/* Sidebar is now always rendered */}
        <MainContainer>
          <TitleTypography variant="h4">
            {isAdmin ? "Admin Panel" : "User Panel"}
          </TitleTypography>

          {notesError && (
            <ErrorTypography>
              Notes Error: {notesError}
            </ErrorTypography>
          )}

          {isAdmin && (
            <>
              <SectionTypography variant="h6">
                User Management
              </SectionTypography>
              {adminLoading ? ( // Show loader for admin users table [new]
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
                  <Loader />
                </Box>
              ) : (
                <StyledTable>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Notes Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>No users available</TableCell>
                      </TableRow>
                    ) : (
                      users.map((user: User) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {notes.filter((note: Note) => note.userId._id === user._id).length}
                          </TableCell>
                        </TableRow>
                      )))
                    }
                  </TableBody>
                </StyledTable>
              )}
            </>
          )}

          <SectionTypography variant="h6">
            Note Management
          </SectionTypography>
          {notesLoading ? ( // Show loader for notes table [new]
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
              <Loader />
            </Box>
          ) : (
            <StyledTable>
              <TableHead>
                <TableRow>
                  <TableCell>Note Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>No notes available</TableCell>
                  </TableRow>
                ) : (
                  notes.map((note: Note) => {
                    return (
                      <TableRow key={note._id}>
                        <TableCell>{note.title}</TableCell>
                        <TableCell>{note.userId.username}</TableCell>
                        <TableCell>
                          {new Date(note.createdAt).toISOString().split("T")[0]}
                        </TableCell>
                        <TableCell>
                          <ActionButton onClick={() => handleNoteClick(note._id)}>
                            View
                          </ActionButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </StyledTable>
          )}
        </MainContainer>
      </Box>
    </>
  );
};

export default Dashboard;