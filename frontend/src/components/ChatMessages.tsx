
"use client";

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';

interface ChatMessage {
  _id: string;
  noteId: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  message: string;
  timestamp: string;
  __v: number;
}

const ChatMessages = () => {
  const { messages } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Paper sx={{ p: 2, flexGrow: 1, overflowY: 'auto', maxHeight: '70vh', bgcolor: 'background.default' }}>
      <List>
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No messages yet. Start the conversation!
          </Typography>
        ) : (
          messages.map((msg) => (
            <ListItem
              key={msg._id}
              sx={{
                flexDirection: user && msg.sender._id === user._id ? 'row-reverse' : 'row',
                bgcolor: user && msg.sender._id === user._id ? 'primary.light' : 'grey.100',
                borderRadius: 2,
                mb: 1,
                maxWidth: '75%',
                alignSelf: user && msg.sender._id === user._id ? 'flex-end' : 'flex-start',
              }}
            >
              <ListItemText
                primary={msg.message}
                secondary={`${msg.sender.username} • ${new Date(msg.timestamp).toLocaleTimeString()}`}
                primaryTypographyProps={{ fontWeight: 'medium' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItem>
          ))
        )}
        <div ref={messagesEndRef} />
      </List>
    </Paper>
  );
};

export default ChatMessages;
