
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import type { AppThunk } from './store';
import Cookies from 'js-cookie';
import { ReactNode } from 'react';

interface ChatMessage {
  username: any;
  content: ReactNode;
  userId: string | undefined;
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

interface ChatState {
  socketInstance: any;
  messages: ChatMessage[];
  connected: boolean;
  error: string | null;
  socket: any; 
}


const initialState: ChatState = {
  socketInstance: null,
  messages: [],
  connected: false,
  error: null,
  socket:[] 
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    connectSocket(state, action: PayloadAction<Socket>) {
      state.socketInstance = action.payload;
      state.connected = true;
      state.error = null;
    },
    disconnectSocket(state) {
      state.socketInstance?.disconnect();
      state.socketInstance = null;
      state.connected = false;
      state.messages = [];
    },
    loadMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    receiveMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const {
  connectSocket,
  disconnectSocket,
  loadMessages,
  receiveMessage,
  setError,
  clearMessages,
} = chatSlice.actions;

export const initializeChat = (noteId: string): AppThunk => (dispatch) => {
  const token = Cookies.get('token');
  if (!token) {
    dispatch(setError('No token found'));
    return;
  }

  const socket = io('http://localhost:5000', {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('WebSocket connected:', socket.id);
    dispatch(connectSocket(socket));
    socket.emit('joinNoteRoom', { noteId });
  });

  socket.on('joinedNoteRoom', ({ noteId, message }) => {
    console.log(message);
  });

  socket.on('loadChatMessages', ({ noteId, messages }) => {
    dispatch(loadMessages(messages));
  });

  socket.on('newChatMessage', (message: ChatMessage) => {
    dispatch(receiveMessage(message));
  });

  socket.on('error', ({ message }) => {
    console.error('WebSocket error:', message);
    dispatch(setError(message));
    dispatch(disconnectSocket());
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
    dispatch(disconnectSocket());
  });
};

export const sendMessage = (noteId: string, content: string): AppThunk => (dispatch, getState) => {
  const { chat } = getState();
  if (!chat.socketInstance || !chat.connected) {
    dispatch(setError('Not connected to chat'));
    return;
  }
  chat.socketInstance.emit('sendChatMessage', { noteId, message: content });
};

export const leaveChat = (noteId: string): AppThunk => (dispatch, getState) => {
  const { chat } = getState();
  if (chat.socketInstance && chat.connected) {
    chat.socketInstance.emit('leaveNoteRoom', { noteId });
    dispatch(disconnectSocket());
  }
};

export default chatSlice.reducer;
