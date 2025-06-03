// page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import NoteIcon from '@mui/icons-material/Note';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import TagIcon from '@mui/icons-material/Tag';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

// Assume this is the Rect sidebar component
interface RectProps {
  onItemClick: (item: string) => void;
}

const Rect: React.FC<RectProps> = ({ onItemClick }) => {
  return (
    <Box sx={{ width: 240, borderRight: 1, borderColor: 'divider', height: '100vh' }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onItemClick('Notes')}>
            <ListItemIcon>
              <NoteIcon />
            </ListItemIcon>
            <ListItemText primary="Notes" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onItemClick('Notebooks')}>
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary="Notebooks" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onItemClick('Shared')}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Shared" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => onItemClick('Tags')}>
            <ListItemIcon>
              <TagIcon />
            </ListItemIcon>
            <ListItemText primary="Tags" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          fullWidth
          sx={{ mb: 1 }}
          onClick={() => console.log('New Note clicked')}
        >
          New Note
        </Button>
        <ListItem disablePadding>
          <ListItemButton onClick={() => console.log('Trash clicked')}>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Trash" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );
};

interface Note {
  title: string;
  date: string;
  tags?: string[];
}

const fetchData = async (): Promise<Note[]> => {
  // In a real application, you would fetch data from your backend API
  // For this example, we'll return mock data.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { title: 'Meeting Notes', date: '2023-08-15', tags: ['Project'] },
        { title: 'Grocery List', date: '2023-08-14', tags: ['Personal'] },
        { title: 'Book Recommendations', date: '2023-08-10', tags: ['Reading'] },
        { title: 'Travel Plans', date: '2023-08-05', tags: ['Travel'] },
        { title: 'Ideas', date: '2023-07-20', tags: ['Brainstorming'] },
      ]);
    }, 500); // Simulate a network request
  });
};

const AllNotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState('Notes');

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData();
      setNotes(data);
    };

    loadData();
  }, []);

  const handleSidebarItemClick = (item: string) => {
    setSelectedItem(item);
    console.log(`Clicked on: ${item}`);
    // You might want to filter data based on the selected item here
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Rect onItemClick={handleSidebarItemClick} />

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search notes"
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* All Notes Section */}
        <Typography variant="h6" gutterBottom>
          All Notes
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNotes.map((note, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {note.title}
                  </TableCell>
                  <TableCell>{note.date}</TableCell>
                  <TableCell>
                    {note.tags &&
                      note.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
                      ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default AllNotesPage;