"use client";

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { checkAuth } from '@/redux/authSlice';
import { Box, CircularProgress } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authenticate = async () => {
      await dispatch(checkAuth());
      setInitialCheckDone(true);
    };
    authenticate();
  }, [dispatch]);

  useEffect(() => {
    const unprotectedPaths = ['/login', '/signup', '/404', '/'];
    if (initialCheckDone && !isAuthenticated && !unprotectedPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, initialCheckDone, pathname, router]);

  if (!initialCheckDone || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  const unprotectedPaths = ['/login', '/signup', '/404', '/'];
  if (!isAuthenticated && !unprotectedPaths.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}