import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import BookIcon from '@mui/icons-material/Book';
import ShareIcon from '@mui/icons-material/Share';
import TagIcon from '@mui/icons-material/Tag';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 250,
        bgcolor: '#fff',
        borderRight: '1px solid #e0e0e0',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      {/* Header with Search */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f0f0f0', borderRadius: 1, p: 0.5 }}>
          <IconButton size="small" sx={{ mr: 0.5 }}>
            <SearchIcon fontSize="small" />
          </IconButton>
          <TextField
            variant="standard"
            placeholder="Search"
            fullWidth
            InputProps={{ disableUnderline: true }}
            sx={{ bgcolor: '#f0f0f0', '& .MuiInputBase-input': { fontSize: '0.9rem' } }}
          />
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          All Notes
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<NotesIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              width: '100%',
              color: '#000',
              '&:hover': { bgcolor: 'transparent' },
              fontSize: '0.9rem',
            }}
          >
            Notes
          </Button>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<BookIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              width: '100%',
              color: '#000',
              '&:hover': { bgcolor: 'transparent' },
              fontSize: '0.9rem',
            }}
          >
            Notebooks
          </Button>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<ShareIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              width: '100%',
              color: '#000',
              '&:hover': { bgcolor: 'transparent' },
              fontSize: '0.9rem',
            }}
          >
            Shared
          </Button>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<TagIcon />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              width: '100%',
              color: '#000',
              '&:hover': { bgcolor: 'transparent' },
              fontSize: '0.9rem',
            }}
          >
            Tags
          </Button>
        </Box>
      </Box>

      {/* Actions */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2, width: '100%', textTransform: 'none', fontSize: '0.9rem' }}
        >
          New Note
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            width: '100%',
            color: '#000',
            '&:hover': { bgcolor: 'transparent' },
            fontSize: '0.9rem',
          }}
        >
          Trash
        </Button>
      </Box>
    </Box>
  );
}