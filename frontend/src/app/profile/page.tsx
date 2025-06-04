// pages/account.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
} from '@mui/material';

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  email: string;
}

const fetchUserProfile = async (): Promise<UserProfile> => {
  // Replace with your actual API endpoint to fetch user profile data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'John Doe',
        username: 'johndoe123',
        bio: 'Software enthusiast',
        email: 'john.doe@example.com',
      });
    }, 200);
  });
};

interface EmailUpdateResponse {
  message: string;
}

const updateUserEmailOnServer = async (newEmail: string): Promise<EmailUpdateResponse> => {
  // Replace with your actual API endpoint to update the user's email
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // console.log('Updating email to:', newEmail);
      // Simulate a successful update
      resolve({ message: 'Email updated successfully' });
      // Simulate an error: reject({ message: 'Failed to update email' });
    }, 300);
  });
};

const AccountPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    username: '',
    bio: '',
    email: '',
  });
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailUpdateMessage, setEmailUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await fetchUserProfile();
      setProfile(data);
      setNewEmail(data.email); // Initialize newEmail with the current email
    };

    loadProfile();
  }, []);

  const handleUpdateEmail = async () => {
    setIsUpdatingEmail(true);
    setEmailUpdateMessage(null);
    try {
      const result = await updateUserEmailOnServer(newEmail);
      setEmailUpdateMessage(result.message);
      // Optionally, update the profile state with the new email
      setProfile((prevProfile) => ({ ...prevProfile, email: newEmail }));
    } catch (error: any) {
      setEmailUpdateMessage(error.message || 'Failed to update email.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account
      </Typography>

      <Typography variant="h6" mt={3} gutterBottom>
        Profile
      </Typography>
      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="name">Name</FormLabel>
        <TextField
          id="name"
          value={profile.name}
          InputProps={{
            readOnly: true,
          }}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="username">Username</FormLabel>
        <TextField
          id="username"
          value={profile.username}
          InputProps={{
            readOnly: true,
          }}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="bio">Bio</FormLabel>
        <TextField
          id="bio"
          value={profile.bio}
          InputProps={{
            readOnly: true,
          }}
          multiline
          rows={2}
        />
      </FormControl>

      <Typography variant="h6" mt={4} gutterBottom>
        Email
      </Typography>
      <FormControl fullWidth margin="normal">
        <FormLabel htmlFor="email">Email</FormLabel>
        <TextField
          id="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          variant="outlined"
          type="email"
        />
      </FormControl>
      <Button
        variant="contained" 
        onClick={handleUpdateEmail}
        disabled={isUpdatingEmail || newEmail === profile.email}
      >
        {isUpdatingEmail ? 'Updating Email...' : 'Update Email'}
      </Button>
      {emailUpdateMessage && (
        <Typography mt={1} color={emailUpdateMessage.includes('Failed') ? 'error' : 'success'}>
          {emailUpdateMessage}
        </Typography>
      )}

      <Typography variant="h6" mt={4} gutterBottom>
        Password
      </Typography>
      <Button variant="outlined">Change Password</Button>
    </Box>
  );
};

export default AccountPage;