import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import type { RootState } from '@/redux/store';

interface ChatMessageProps {
  sender: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, message, timestamp, isCurrentUser }) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isCurrentUser && currentUser) {
      setUsername(currentUser.username);
    } else if (sender !== 'system') {
      // Fetch username for other users
      const fetchUsername = async () => {
        try {
          const response = await fetch(`http://localhost:5000/users/${sender}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUsername(userData.username);
          } else {
            setUsername('Unknown');
          }
        } catch (err) {
          console.error('Failed to fetch username:', err);
          setUsername('Unknown');
        }
      };
      fetchUsername();
    }
  }, [sender, isCurrentUser, currentUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          p: 1.5,
          borderRadius: 2,
          bgcolor: isCurrentUser ? 'primary.main' : sender === 'system' ? 'grey.200' : 'grey.300',
          color: isCurrentUser ? 'white' : 'text.primary',
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {sender === 'system' ? 'System' : username || sender}
        </Typography>
        <Typography variant="body1">{message}</Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {new Date(timestamp).toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatMessage;