"use client";

import { Box, Typography, TextField, Button, Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setEmail, setPassword, login, setLoading } from '@/redux/authSlice';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { email, password, loading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);



  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [error]);

  const handleLogin = () => {
    dispatch(login());
  };

  const handleCancel = () => {
    dispatch(setLoading(false));
    dispatch(setEmail(''));
    dispatch(setPassword(''));
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Header />
      <ToastContainer />
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 64px)',
          }}
        >
          <Loader onCancel={handleCancel} />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 64px)',
          }}
        >
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
            Log In to Your Account
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography variant="body1" sx={{ mb: 1, color: '#555' }}>
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="Email"
              value={email}
              onChange={(e) => dispatch(setEmail(e.target.value))}
              sx={{
                mb: 3,
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
              disabled={loading}
            />
            <Typography variant="body1" sx={{ mb: 1, color: '#555' }}>
              Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => dispatch(setPassword(e.target.value))}
              sx={{
                mb: 4,
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
              disabled={loading}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
              sx={{
                mb: 2,
                bgcolor: '#1976d2',
                borderRadius: '20px',
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Log In
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#555' }}>
              Don’t have an account?{' '}
              <Link href="/signup" sx={{ color: '#1976d2', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}