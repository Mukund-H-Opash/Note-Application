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
import { styled } from '@mui/material/styles';
import { createNote, fetchNotes, updateNote } from "@/redux/notesSlice";
import { checkAuth } from "@/redux/authSlice";

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
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
  },
  '& .MuiInputLabel-root': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    color: '#718096',
  },
  '& .MuiInputBase-root:hover': {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  '& .MuiInputBase-root.Mui-focused': {
    boxShadow: '0 2px 12px rgba(59, 130, 246, 0.2)',
  },
  '& .MuiInputBase-input': {
    color: '#2d3748',
  },
  '& .MuiInputBase-input:disabled': {
    color: '#718096',
    backgroundColor: '#f1f5f9',
  },
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
  '& .MuiChip-deleteIcon': {
    color: '#718096',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));

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
        await dispatch(updateNote(id as string, { title, content, tags, collaborators }));
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: '#f8fafc' }}>
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
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <MainContainer>
        <TitleTypography variant="h4">
          {pageTitle}
        </TitleTypography>
        {error && (
          <ErrorTypography>
            Error: {error}
          </ErrorTypography>
        )}
        <form onSubmit={handleSubmit}>
          <StyledTextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required={!isAddCollaboratorMode}
            disabled={isAddCollaboratorMode}
            sx={{ mb: 3 }}
          />
          <StyledTextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={6}
            required={!isAddCollaboratorMode}
            disabled={isAddCollaboratorMode}
            sx={{ mb: 3 }}
          />
          <StyledTextField
            label="Tags (press Enter to add)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            fullWidth
            disabled={isAddCollaboratorMode}
            sx={{ mb: 3 }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            {tags.map((tag) => (
              <StyledChip
                key={tag}
                label={tag}
                onDelete={isAddCollaboratorMode ? undefined : () => handleRemoveTag(tag)}
                variant="filled"
              />
            ))}
          </Box>
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(option: User) => option.username}
            value={users.filter((user: User) => collaborators.includes(user._id))}
            onChange={(_, value: User[]) => setCollaborators(value.map((user) => user._id))}
            renderInput={(params) => (
              <StyledTextField {...params} label="Collaborators" placeholder="Select users" />
            )}
            sx={{ mb: 3 }}
            renderOption={(props, option: User) => (
              <li {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.95rem', color: '#2d3748' }}>
                    {option.username}
                  </Typography>
                  <Typography sx={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: '#718096' }}>
                    {option.email}
                  </Typography>
                </Box>
              </li>
            )}
          />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <ActionButton
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
            >
              {isEditMode ? "Edit Note" : isAddCollaboratorMode ? "Add Collaborator" : "Create Note"}
            </ActionButton>
            <ActionButton
              variant="outlined"
              sx={{
                borderColor: '#6b7280',
                color: '#6b7280',
                '&:hover': { borderColor: '#4b5563', color: '#4b5563', backgroundColor: '#f1f5f9' },
              }}
              onClick={() => router.push("/notes")}
            >
              Cancel
            </ActionButton>
          </Box>
        </form>
      </MainContainer>
    </>
  );
};

export default CreateNotePage;