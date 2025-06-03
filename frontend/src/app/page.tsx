"use client";

import { Box, Typography, Button } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { useRouter } from 'next/navigation';

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        Welcome to Note Application
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
        Organize your thoughts, collaborate with others, and manage your notes efficiently.
      </Typography>
      <Button
        variant="contained"
        onClick={handleGetStarted}
        sx={{
          bgcolor: '#1976d2',
          borderRadius: '20px',
          textTransform: 'none',
          py: 1.5,
          fontSize: '1rem',
        }}
      >
        Get Started
      </Button>
    </Box>
  );
}
