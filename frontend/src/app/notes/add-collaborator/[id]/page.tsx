
"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  Chip,
} from "@mui/material";
import { createNote, fetchNotes, updateNote } from "@/redux/notesSlice";
import { checkAuth } from "@/redux/authSlice";

const CreateNotePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { id } = useParams();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { notes, loading, error } = useSelector((state: RootState) => state.notes);
  const users = useSelector((state: RootState) => state.admin.users);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const isEditMode = !!id && pathname?.includes("/edit");
  const isAddCollaboratorMode = !!id && pathname?.includes("/add-collaborator");
  const pageTitle = isEditMode
    ? "Edit Note"
    : isAddCollaboratorMode
    ? "Add Collaborator"
    : "Create Note";

  useEffect(() => {
    const verifyAuth = async () => {
      await dispatch(checkAuth());
      if (!isAuthenticated) {
        router.push("/login");
      } else if (id && (isEditMode || isAddCollaboratorMode)) {
        const note = notes.find((n) => n._id === id);
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setTags(note.tags);
          setCollaborators(note.collaborators);
        } else {
          // Fetch note if not in state
          await dispatch(fetchNotes());
          const updatedNote = notes.find((n) => n._id === id);
          if (updatedNote) {
            setTitle(updatedNote.title);
            setContent(updatedNote.content);
            setTags(updatedNote.tags);
            setCollaborators(updatedNote.collaborators);
          }
        }
      }
    };

    verifyAuth();
  }, [dispatch, isAuthenticated, router, id, notes, isEditMode, isAddCollaboratorMode]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      e.preventDefault();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode || isAddCollaboratorMode) {
      if (id) {
        await dispatch(updateNote(id as string, { collaborators }));
      }
    } else {
      await dispatch(createNote({ title, content, tags, collaborators }));
    }

    if (!error) {
      router.push("/notes");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {pageTitle}
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required={!isAddCollaboratorMode}
            disabled={isAddCollaboratorMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required={!isAddCollaboratorMode}
            disabled={isAddCollaboratorMode}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tags (press Enter to add)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            fullWidth
            disabled={isAddCollaboratorMode}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={isAddCollaboratorMode ? undefined : () => handleRemoveTag(tag)}
                color="primary"
              />
            ))}
          </Box>
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option) => option.username}
            value={users.filter((user) => collaborators.includes(user._id))}
            onChange={(_, value) => setCollaborators(value.map((user) => user._id))}
            renderInput={(params) => (
              <TextField {...params} label="Collaborators" placeholder="Select users" />
            )}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {isEditMode ? "Update Note" : isAddCollaboratorMode ? "Add Collaborator" : "Create Note"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push("/notes")}
            sx={{ ml: 2 }}
          >
            Cancel
          </Button>
        </form>
      </Box>
    </>
  );
};

export default CreateNotePage;