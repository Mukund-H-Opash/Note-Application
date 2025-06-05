"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Chip,
  Fade,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import Cookies from 'js-cookie';
import { checkAuth } from "@/redux/authSlice";
import { fetchProfile } from "@/redux/profileSlice";

// Custom styled components
const MainContainer = styled(Box)({
  maxWidth: 900,
  margin: '32px auto',
  padding: '32px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  fontFamily: "'Inter', sans-serif",
  minHeight: '80vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ProfileCard = styled(Card)({
  background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  maxWidth: 600,
  width: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },
});

const TitleTypography = styled(Typography)({
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 700,
  fontSize: '2rem',
  color: '#1a202c',
  marginBottom: '16px',
  textAlign: 'center',
});

const InfoTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  color: '#2d3748',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ErrorTypography = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  color: '#dc2626',
  backgroundColor: '#fef2f2',
  padding: '12px',
  borderRadius: '8px',
  marginBottom: '16px',
  textAlign: 'center',
});

const ActionButton = styled(Button)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontWeight: 500,
  fontSize: '0.9rem',
  textTransform: 'none',
  borderRadius: '8px',
  padding: '10px 24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 500,
  borderRadius: '6px',
  backgroundColor: '#dbeafe',
  color: theme.palette.primary.main,
  border: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: '#bfdbfe',
    transform: 'scale(1.05)',
  },
}));

const ProfileAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  margin: '0 auto 16px',
  fontSize: '3rem',
  fontWeight: 600,
  fontFamily: "'Inter', sans-serif",
  background: 'linear-gradient(45deg, #3b82f6, #ec4899)',
  border: '4px solid #ffffff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

// Utility to generate avatar background color based on username
const getAvatarColor = (username: string | undefined | null) => {
  const colors = [
    'linear-gradient(45deg, #3b82f6, #ec4899)',
    'linear-gradient(45deg, #10b981, #3b82f6)',
    'linear-gradient(45deg, #f97316, #ef4444)',
    'linear-gradient(45deg, #8b5cf6, #d946ef)',
  ];
  if (!username || typeof username !== "string" || username.length === 0) {
    return colors[0];
  }
  const index = username.length % colors.length;
  return colors[index];
};

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    const verifyAuthAndFetchProfile = async () => {
      await dispatch(checkAuth());
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        await dispatch(fetchProfile());
      }
    };

    verifyAuthAndFetchProfile();
  }, [dispatch, isAuthenticated, router]);

  const handleEditProfile = () => {
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    // await dispatch(logout());
    Cookies.remove('auth');
    router.push("/login");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", bgcolor: '#f8fafc' }}>
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <MainContainer>
        <ErrorTypography>
          Error: {error}
        </ErrorTypography>
        <ActionButton
          variant="contained"
          sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </ActionButton>
      </MainContainer>
    );
  }

  if (!profile) {
    return (
      <MainContainer>
        <ErrorTypography>
          Profile not found
        </ErrorTypography>
        <ActionButton
          variant="contained"
          sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </ActionButton>
      </MainContainer>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap"
        rel="stylesheet"
      />
      <Head>
        <title>Profile</title>
      </Head>
      <Fade in timeout={500}>
        <MainContainer>
          <ProfileCard>
            <CardContent sx={{ padding: '32px', textAlign: 'center' }}>
              <ProfileAvatar
                sx={{ background: getAvatarColor(profile.username) }}
              >
                {profile.username ? profile.username[0].toUpperCase() : "?"}
              </ProfileAvatar>
              <TitleTypography variant="h4">
                {profile.username}
              </TitleTypography>
              <InfoTypography>
                <strong>Email:</strong> {profile.email}
              </InfoTypography>
              <InfoTypography>
                <strong>Roles:</strong>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(profile.roles ?? []).map((role) => (
                    <StyledChip key={role} label={role} variant="filled" />
                  ))}
                </Box>
              </InfoTypography>
              <InfoTypography>
                <strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}
              </InfoTypography>
              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <ActionButton
                  variant="contained"
                  sx={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
                  onClick={handleEditProfile}
                >
                  Back
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  sx={{
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    '&:hover': { borderColor: '#b91c1c', color: '#b91c1c', backgroundColor: '#fef2f2' },
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </ActionButton>
              </Box>
            </CardContent>
          </ProfileCard>
        </MainContainer>
      </Fade>
    </>
  );
};

export default ProfilePage;