
"use client";

import React, { useEffect } from "react";
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
import { fetchNoteById, fetchCollaborators } from "@/redux/notesSlice";
import { checkAuth } from "@/redux/authSlice";

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
  const { id } = useParams();
  // Move all useSelector calls to the top
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { currentNote, collaborators, loading, error } = useSelector((state: RootState) => state.notes);
  const users = useSelector((state: RootState) => state.admin.users);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(checkAuth());
      if (isAuthenticated && id) {
        await dispatch(fetchNoteById(id as string));
      } else {
        router.push("/login");
      }
    };
    fetchData();
  }, [id, isAuthenticated, dispatch, router]);

  useEffect(() => {
    if (currentNote && currentNote.collaborators.length > 0) {
      dispatch(fetchCollaborators(currentNote.collaborators));
    }
  }, [currentNote, dispatch]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleEdit = () => {
    router.push(`/notes/edit/${id}`);
  };

  // Early returns after all Hooks are called
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error: {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!currentNote) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Note not found</Typography>
        <Button variant="contained" color="primary" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const author = users.find((u) => u._id === currentNote.userId);
  const isOwner = user ? currentNote.userId === user._id : false;
  const isCollaborator = user ? currentNote.collaborators.includes(user._id) : false;

  return (
    <>
      <Head>
        <title>{currentNote.title}</title>
      </Head>
      <Fade in timeout={500}>
        <Box
          sx={{
            maxWidth: 800,
            mx: "auto",
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            mt: 4,
          }}
        >
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                {currentNote.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: "text.primary" }}>
                {currentNote.content}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Author: {author ? author.username : "Unknown"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Created: {new Date(currentNote.createdAt).toISOString().split("T")[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Updated: {new Date(currentNote.updatedAt).toISOString().split("T")[0]}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {currentNote.tags.map((tag) => (
                  <Chip key={tag} label={tag} color="primary" variant="outlined" size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "medium" }}>
            Collaborators
          </Typography>
          {collaborators.length === 0 ? (
            <Typography color="text.secondary">No collaborators found</Typography>
          ) : (
            <List sx={{ bgcolor: "background.default", borderRadius: 2, p: 1 }}>
              {collaborators.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <ListItemText
                    primary={user.username}
                    secondary={user.email}
                    primaryTypographyProps={{ fontWeight: "medium" }}
                    secondaryTypographyProps={{ color: "text.secondary" }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Edit Note
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleBack}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Back to Dashboard
            </Button>
            {/* {(isOwner || isCollaborator || user?.roles?.includes("admin")) && ( */}
              <Button
               variant="contained" 
               color="info" onClick={() => router.push(`/chat/${id}`)} sx={{ borderRadius: 2, px: 4 }}>
                Open Chat
              </Button>
            {/* )} */}
          </Box>
        </Box>
      </Fade>
    </>
  );
};

export default NotePage;
