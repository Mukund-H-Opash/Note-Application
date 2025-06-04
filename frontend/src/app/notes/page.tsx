"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
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
  Chip,
  Collapse,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import { fetchNotes, fetchCollaborators, deleteNote } from "@/redux/notesSlice";
import { checkAuth } from "@/redux/authSlice";
import Sidebar from "@/components/Sidebar";

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
  flexGrow: 1,
  maxWidth: 1200,
  margin: '32px auto',
  padding: '32px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  fontFamily: "'Inter', sans-serif",
  minHeight: '80vh',
});

const TitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  fontSize: '2rem',
  color: '#1a202c',
  marginBottom: '24px',
  letterSpacing: '-0.02em',
});

const ErrorTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#dc2626',
  backgroundColor: '#fef2f2',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '16px',
  textAlign: 'center',
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
    transition: 'background-color 0.2s ease',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f1f5f9',
  },
});

const ActionButton = styled(Button)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '0.85rem',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '8px 16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const CreateButton = styled(Button)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '0.9rem',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
  color: '#ffffff',
  marginBottom: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)',
    transform: 'translateY(-2px)',
  },
}));

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

const CollapseContent = styled(Box)({
  backgroundColor: '#ffffff',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)',
});

const SectionTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  fontSize: '1.25rem',
  color: '#1a202c',
  marginBottom: '16px',
});

const StyledIconButton = styled(IconButton)({
  color: '#718096',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: '#3b82f6',
    backgroundColor: '#f1f5f9',
  },
});

const StyledDialog = styled(Dialog)({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    padding: '16px',
    fontFamily: "'Inter', sans-serif",
  },
});

const DialogTitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 600,
  fontSize: '1.25rem',
  color: '#1a202c',
});

const DialogContentTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.95rem',
  color: '#2d3748',
});

const NotesListPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { notes, collaborators, loading, error } = useSelector((state: RootState) => state.notes);
  const users = useSelector((state: RootState) => state.admin.users);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      await dispatch(checkAuth());
      if (isAuthenticated && !hasFetched) {
        await dispatch(fetchNotes());
        setHasFetched(true);
      } else if (!isAuthenticated) {
        router.push("/login");
      }
    };

    verifyAuth();
  }, [isAuthenticated, dispatch, router, hasFetched]);

  useEffect(() => {
    if (hasFetched && notes.length > 0) {
      const allCollaboratorIds = Array.from(
        new Set(notes.flatMap((note) => note.collaborators))
      );
      if (allCollaboratorIds.length > 0) {
        dispatch(fetchCollaborators(allCollaboratorIds));
      }
    }
  }, [notes, hasFetched, dispatch]);

  const handleExpand = (noteId: string) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  const handleCreateNote = () => {
    router.push("/notes/create");
  };

  const handleEditNote = (noteId: string) => {
    router.push(`/notes/edit/${noteId}`);
  };

  const handleAddCollaborator = (noteId: string) => {
    router.push(`/notes/add-collaborator/${noteId}`);
  };

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await dispatch(deleteNote(noteToDelete));
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
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
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </ActionButton>
      </MainContainer>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <Head>
        <title>Notes</title>
      </Head>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <MainContainer>
          <TitleTypography variant="h4">
            Notes
          </TitleTypography>
          <CreateButton
            variant="contained"
            onClick={handleCreateNote}
          >
            Create Note
          </CreateButton>
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell>Note Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No notes available</TableCell>
                </TableRow>
              ) : (
                notes.map((note) => {
                  const author = users.find((user: User) => user._id === note.userId);
                  const noteCollaborators = collaborators.filter((user) =>
                    note.collaborators.includes(user._id)
                  );
                  return (
                    <React.Fragment key={note._id}>
                      <TableRow>
                        <TableCell>{note.title}</TableCell>
                        <TableCell>{author ? author.username : "Unknown"}</TableCell>
                        <TableCell>{new Date(note.createdAt).toISOString().split("T")[0]}</TableCell>
                        <TableCell>
                          <ActionButton
                            variant="outlined"
                            sx={{
                              borderColor: '#3b82f6',
                              color: '#3b82f6',
                              '&:hover': { borderColor: '#2563eb', color: '#2563eb', backgroundColor: '#f1f5f9' },
                              mr: 1,
                            }}
                            onClick={() => handleEditNote(note._id)}
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="outlined"
                            sx={{
                              borderColor: '#6b7280',
                              color: '#6b7280',
                              '&:hover': { borderColor: '#4b5563', color: '#4b5563', backgroundColor: '#f1f5f9' },
                              mr: 1,
                            }}
                            onClick={() => handleAddCollaborator(note._id)}
                          >
                            Add Collaborator
                          </ActionButton>
                          <ActionButton
                            variant="outlined"
                            sx={{
                              borderColor: '#dc2626',
                              color: '#dc2626',
                              '&:hover': { borderColor: '#b91c1c', color: '#b91c1c', backgroundColor: '#fef2f2' },
                            }}
                            onClick={() => handleDeleteNote(note._id)}
                          >
                            Delete
                          </ActionButton>
                        </TableCell>
                        <TableCell>
                          <StyledIconButton onClick={() => handleExpand(note._id)}>
                            {expandedNoteId === note._id ? <ExpandLess /> : <ExpandMore />}
                          </StyledIconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0 }}>
                          <Collapse in={expandedNoteId === note._id}>
                            <CollapseContent>
                              <SectionTypography variant="h6">
                                Content
                              </SectionTypography>
                              <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: '#2d3748', mb: 2, lineHeight: 1.6 }}>
                                {note.content}
                              </Typography>
                              <SectionTypography variant="h6">
                                Tags
                              </SectionTypography>
                              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                {note.tags.map((tag) => (
                                  <StyledChip key={tag} label={tag} variant="filled" />
                                ))}
                              </Box>
                              <SectionTypography variant="h6">
                                Collaborators
                              </SectionTypography>
                              {noteCollaborators.length === 0 ? (
                                <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: '#718096' }}>
                                  No collaborators
                                </Typography>
                              ) : (
                                <StyledTable size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Username</TableCell>
                                      <TableCell>Email</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {noteCollaborators.map((user) => (
                                      <TableRow key={user._id}>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </StyledTable>
                              )}
                            </CollapseContent>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </StyledTable>

          <StyledDialog open={deleteDialogOpen} onClose={cancelDelete}>
            <DialogTitle>
              <DialogTitleTypography>Confirm Deletion</DialogTitleTypography>
            </DialogTitle>
            <DialogContent>
              <DialogContentTypography>
                Are you sure you want to delete this note? This action cannot be undone.
              </DialogContentTypography>
            </DialogContent>
            <DialogActions>
              <ActionButton
                sx={{
                  color: '#6b7280',
                  '&:hover': { color: '#4b5563', backgroundColor: '#f1f5f9' },
                }}
                onClick={cancelDelete}
              >
                Cancel
              </ActionButton>
              <ActionButton
                sx={{
                  color: '#dc2626',
                  '&:hover': { color: '#b91c1c', backgroundColor: '#fef2f2' },
                }}
                onClick={confirmDelete}
              >
                Delete
              </ActionButton>
            </DialogActions>
          </StyledDialog>
        </MainContainer>
      </Box>
    </>
  );
};

export default NotesListPage;