import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  return (
    <AppBar position="static" sx={{ bgcolor: '#fff', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#000', fontWeight: 'bold', mr: 1 }}>
            Notelt
          </Typography>
        </Box>
        <Box>
          <Button color="inherit" sx={{ color: '#555', textTransform: 'none', mr: 2 }}>
            Features
          </Button>
          <Button color="inherit" sx={{ color: '#555', textTransform: 'none', mr: 2 }}>
            Plans
          </Button>
          <Button color="inherit" sx={{ color: '#555', textTransform: 'none', mr: 2 }}>
            Help
          </Button>
          <Button
            variant="outlined"
            sx={{ color: '#1976d2', borderColor: '#1976d2', textTransform: 'none', borderRadius: '20px' }}
            onClick={() => router.push('/login')}
          >
            Log In
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}