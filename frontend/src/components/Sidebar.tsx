import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import NotesIcon from '@mui/icons-material/Notes';
import BookIcon from '@mui/icons-material/Book';
import ShareIcon from '@mui/icons-material/Share';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();

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
    

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          All Notes
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<NotesIcon />}
            onClick={() => router.push('/dashboard')}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              width: '100%',
              color: '#000',
              '&:hover': { bgcolor: 'transparent' },
              fontSize: '0.9rem',
            }}
          >
            Dashboard
          </Button>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Button
            startIcon={<BookIcon />}
            onClick={() => router.push('/notes')}
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
            startIcon={<ShareIcon />}
            onClick={() => router.push('/chat')}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              width: '100%',
              color: '#000',
              '&:hover': { bgcolor: 'transparent' },
              fontSize: '0.9rem',
            }}
          >
            chat
          </Button>
        </Box>
        
      </Box>

      {/* Actions */}
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/notes/create')}
          sx={{ mb: 2, width: '100%', textTransform: 'none', fontSize: '0.9rem' }}
        >
          New Note
        </Button>
      </Box>
    </Box>
  );
}