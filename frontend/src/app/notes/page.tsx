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

const NotePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { notes, collaborators, loading, error } = useSelector((state: RootState) => state.notes);
  const users = useSelector((state: RootState) => state.admin.users);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Verify authentication and fetch notes
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

  // Fetch collaborators after notes are loaded
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">Error: {error}</Typography>
        <Button variant="contained" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Notes</title>
      </Head>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, maxWidth: 1200, mx: "auto", p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Notes
          </Typography>
          <Button variant="contained" color="primary" onClick={handleCreateNote} sx={{ mb: 2 }}>
            Create Note
          </Button>
          <Table>
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
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleEditNote(note._id)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleAddCollaborator(note._id)}
                            sx={{ mr: 1 }}
                          >
                            Add Collaborator
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteNote(note._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleExpand(note._id)}>
                            {expandedNoteId === note._id ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0 }}>
                          <Collapse in={expandedNoteId === note._id}>
                            <Box sx={{ p: 2, bgcolor: "background.paper" }}>
                              <Typography variant="h6" gutterBottom>
                                Content
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {note.content}
                              </Typography>
                              <Typography variant="h6" gutterBottom>
                                Tags
                              </Typography>
                              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                                {note.tags.map((tag) => (
                                  <Chip key={tag} label={tag} color="primary" variant="outlined" />
                                ))}
                              </Box>
                              <Typography variant="h6" gutterBottom>
                                Collaborators
                              </Typography>
                              {noteCollaborators.length === 0 ? (
                                <Typography>No collaborators</Typography>
                              ) : (
                                <Table size="small">
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
                                </Table>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this note? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={cancelDelete} color="primary">
                Cancel
              </Button>
              <Button onClick={confirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </>
  );
};

export default NotePage;
