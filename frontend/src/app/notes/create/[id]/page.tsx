// pages/notes/[id].tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Note {
  _id: string;
  title: string;
  content: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  collaborators?: User[];
}

interface User {
  _id: string;
  name: string;
}

const fetchNote = async (id: string): Promise<Note | null> => {
  // Replace with your actual API endpoint to fetch a single note by ID
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data - replace with actual API response
      const mockNotes: Note[] = [
        {
          _id: '1',
          title: 'Meeting Notes',
          content: 'Discussed project timeline and next steps.',
          tags: ['Project', 'Important'],
          createdAt: '2023-08-15T10:00:00.000Z',
          updatedAt: '2023-08-15T11:00:00.000Z',
          collaborators: [{ _id: 'user1', name: 'Alice' }],
        },
        {
          _id: '2',
          title: 'Grocery List',
          content: 'Milk, eggs, bread, cheese.',
          tags: ['Personal'],
          createdAt: '2023-08-14T16:30:00.000Z',
          updatedAt: '2023-08-14T16:30:00.000Z',
        },
      ];
      const foundNote = mockNotes.find((note) => note._id === id);
      resolve(foundNote || null);
    }, 300);
  });
};

const NoteDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const loadNote = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedNote = await fetchNote(id);
          setNote(fetchedNote);
        } catch (err: any) {
          setError('Failed to load note.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      loadNote();
    }
  }, [id]);

  const handleGoBack = () => {
    router.push('/'); // Or wherever you want to go back to
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!note) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography>Note not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <IconButton onClick={handleGoBack} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {note.title}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Created At: {new Date(note.createdAt).toLocaleDateString()}
          {note.updatedAt !== note.createdAt && (
            <>
              <br />
              Updated At: {new Date(note.updatedAt).toLocaleDateString()}
            </>
          )}
        </Typography>
        {note.tags && note.tags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {note.tags.map((tag) => (
              <Chip key={tag} label={tag} sx={{ mr: 0.5 }} />
            ))}
          </Box>
        )}
        <Typography paragraph>{note.content}</Typography>
        {note.collaborators && note.collaborators.length > 0 && (
          <Box mt={2}>
            <Typography variant="subtitle1">Collaborators:</Typography>
            {note.collaborators.map((user) => (
              <Chip key={user._id} label={user.name} sx={{ mr: 0.5 }} icon={<PersonIcon />} />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default NoteDetailPage;