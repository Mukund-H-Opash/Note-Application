// pages/create-note.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Autocomplete,
  FormControl,
  FormLabel,
} from '@mui/material';
import { Tag as TagIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  name: string;
}

const fetchCollaborators = async (): Promise<User[]> => {
  // Replace with your actual API endpoint to fetch collaborators
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { _id: 'user1', name: 'Alice' },
        { _id: 'user2', name: 'Bob' },
        { _id: 'user3', name: 'Charlie' },
      ]);
    }, 300);
  });
};

const createNoteOnServer = async (noteData: {
  title: string;
  content: string;
  tags: string[];
  collaborators: string[];
}) => {
  try {
    const response = await fetch('/api/notes', { // Assuming your API route is /api/notes
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create note');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error creating note:', error.message);
    throw error;
  }
};

const CreateNotePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const loadCollaborators = async () => {
      const users = await fetchCollaborators();
      setCollaborators(users);
    };

    loadCollaborators();
  }, []);

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => () => {
    setTags((currentTags) => currentTags.filter((tag) => tag !== tagToDelete));
  };

  const handleCreateNote = async () => {
    try {
      const collaboratorIds = selectedCollaborators.map((user) => user._id);
      const newNote = await createNoteOnServer({ title, content, tags, collaborators: collaboratorIds });
      console.log('Note created:', newNote);
      router.push('/'); // Redirect to the home page after successful creation
    } catch (error: any) {
      // Handle error (e.g., display a message to the user)
      console.error('Failed to create note:', error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Note
      </Typography>

      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="note-title">Title</FormLabel>
        <TextField
          id="note-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          variant="outlined"
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="note-content">Content</FormLabel>
        <TextField
          id="note-content"
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
        />
      </FormControl>

      <FormControl fullWidth margin="normal">
        <FormLabel>Tags</FormLabel>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Add tag"
            variant="outlined"
            size="small"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTag) {
                handleAddTag();
              }
            }}
            sx={{ mr: 1 }}
          />
          <Button variant="outlined" size="small" onClick={handleAddTag} startIcon={<TagIcon />}>
            Add
          </Button>
        </Box>
        <Box sx={{ mt: 1 }}>
          {tags.map((tag) => (
            <Chip key={tag} label={tag} onDelete={handleDeleteTag(tag)} sx={{ mr: 0.5 }} />
          ))}
        </Box>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <FormLabel>Collaborators</FormLabel>
        <Autocomplete
          multiple
          id="collaborators"
          options={collaborators}
          getOptionLabel={(user) => user.name}
          value={selectedCollaborators}
          onChange={(event, newValue) => {
            setSelectedCollaborators(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Select collaborators"
            />
          )}
        />
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateNote}
        sx={{ mt: 2 }}
        startIcon={<PersonAddIcon />}
      >
        Create Note
      </Button>
    </Box>
  );
};

export default CreateNotePage;