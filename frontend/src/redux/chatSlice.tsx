import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  connected: boolean;
  error: string | null;
  socketId: string | null;
  lastSystemMessage: string | null;
}

const initialState: ChatState = {
  messages: [],
  connected: false,
  error: null,
  socketId: null,
  lastSystemMessage: null,
};

// Use a ref to track socket instance
let socketInstance: Socket | null = null;

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload;
      if (message.sender === 'system') {
        if (state.lastSystemMessage === message.message) {
          return;
        }
        state.lastSystemMessage = message.message;
      } else {
        const lastMessage = state.messages[state.messages.length - 1];
        if (
          lastMessage &&
          lastMessage.sender === message.sender &&
          lastMessage.message === message.message &&
          Math.abs(new Date(lastMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) < 2000
        ) {
          return;
        }
      }
      state.messages.push(message);
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSocket(state, action: PayloadAction<string | null>) {
      state.socketId = action.payload;
    },
  },
});

export const { setMessages, addMessage, setConnected, setError, setSocket } = chatSlice.actions;

export const initializeSocket = (noteId: string, userId: string): AppThunk => async (dispatch, getState) => {
  const { auth, notes } = getState();
  const user = auth.user;
  const currentNote = notes.currentNote;

  console.log('Initializing socket with userId:', userId, 'and user:', user); // Debug log

  if (!user || !userId) {
    dispatch(setError('User not authenticated.'));
    return;
  }

  if (!currentNote) {
    dispatch(setError('Note not found.'));
    return;
  }
  const isCollaborator = currentNote.collaborators.includes(userId) || currentNote.userId === userId;
  if (!isCollaborator) {
    dispatch(setError('You are not a collaborator of this note and cannot join the chat.'));
    return;
  }

  if (socketInstance) {
    console.log('Socket already initialized, reusing instance');
    dispatch(setSocket(socketInstance?.id || null));
    dispatch(setConnected(socketInstance.connected));
    socketInstance.emit('joinNoteRoom', { noteId, userId });
    return;
  }

  try {
    socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 3,
      timeout: 10000,
      transports: ['websocket'],
    });

    dispatch(setSocket(socketInstance.id || null));

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance?.id);
      dispatch(setConnected(true));
      dispatch(setError(null));
      socketInstance?.emit('joinNoteRoom', { noteId, userId });
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      dispatch(setError('Failed to connect to chat server. Please try again later.'));
      dispatch(setConnected(false));
    });

    socketInstance.on('error', (data) => {
      console.error('Server error:', data.message);
      dispatch(setError(data.message));
      dispatch(setConnected(false));
    });

    socketInstance.on('joinedNoteRoom', (data) => {
      console.log('Joined note room:', data);
      dispatch(addMessage({ sender: 'system', message: data.message, timestamp: new Date().toISOString() }));
    });

    socketInstance.on('newChatMessage', (data) => {
      const normalizedSender = String(data.sender);
      const normalizedUserId = String(userId);
      console.log('New chat message received:', { sender: normalizedSender, userId: normalizedUserId, message: data.message });
      if (normalizedSender !== normalizedUserId) {
        dispatch(addMessage({ sender: normalizedSender, message: data.message, timestamp: new Date().toISOString() }));
      } else {
        console.log('Skipping message from self:', { sender: normalizedSender, userId: normalizedUserId });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      dispatch(setConnected(false));
      dispatch(setError('Disconnected from chat server.'));
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Socket initialization error:', errorMessage);
    dispatch(setError('Failed to initialize chat. Please try again.'));
  }
};

export const sendMessage = (noteId: string, message: string, sender: string): AppThunk => async (dispatch, getState) => {
  const { chat } = getState();
  if (!chat.connected || !socketInstance) {
    dispatch(setError('Cannot send message. Not connected to chat server.'));
    return;
  }
  if (!message.trim() || message.length > 500) {
    dispatch(setError(message.trim() ? 'Message too long (max 500 characters)' : 'Cannot send empty message'));
    return;
  }
  console.log('Sending message with sender:', sender); // Debug log
  socketInstance.emit('sendChatMessage', { noteId, message, sender });
  dispatch(addMessage({ sender, message, timestamp: new Date().toISOString() }));
};

export const disconnectSocket = (): AppThunk => async (dispatch, getState) => {
  const { chat } = getState();
  if (chat.socketId && socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    dispatch(setSocket(null));
    dispatch(setConnected(false));
    dispatch(setMessages([]));
  }
};

export default chatSlice.reducer;