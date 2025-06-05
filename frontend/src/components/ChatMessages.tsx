import React from 'react';
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
  
  const displayName = isCurrentUser
    ? "You"
    : sender === 'system'
      ? "System"
      : "User";

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
          {displayName}
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