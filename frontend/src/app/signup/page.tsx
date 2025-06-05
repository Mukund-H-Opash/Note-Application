"use client";

import { Box, Typography, TextField, Button, Link, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setUsername, setEmail, setPassword, setRoles, signup, setLoading } from '@/redux/authSlice';
import Header from '@/components/Header';
import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Signup() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { username, email, password, roles, loading, isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSignup = () => {
    dispatch(signup());
  };

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

  const handleCancel = () => {
    dispatch(setLoading(false));
    dispatch(setUsername(''));
    dispatch(setEmail(''));
    dispatch(setPassword(''));
    dispatch(setRoles(['User']));
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/login');
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
            Create your account
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <Typography variant="body1" sx={{ mb: 1, color: '#555' }}>
              Username
            </Typography>
            <TextField
              fullWidth
              placeholder="Username"
              value={username}
              onChange={(e) => dispatch(setUsername(e.target.value))}
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
                mb: 3,
                borderRadius: '10px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                },
              }}
              disabled={loading}
            />
            <Typography variant="body1" sx={{ mb: 1, color: '#555' }}>
              Roles
            </Typography>
            <FormControl fullWidth sx={{ mb: 4, borderRadius: '10px' }}>
              <Select
                multiple
                value={roles}
                onChange={(e) => dispatch(setRoles(e.target.value as string[]))}
                sx={{
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
                disabled={loading}
              >
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSignup}
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
              Sign Up
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#555' }}>
              Already have an account?{' '}
              <Link href="/login" sx={{ color: '#1976d2', textDecoration: 'none' }}>
                Log In
              </Link>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}