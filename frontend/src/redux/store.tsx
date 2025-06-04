import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import adminReducer from './adminSlice';
import notesReducer from './notesSlice';
import authReducer from './authSlice';
import chatReducer from './chatSlice';
import profilReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    notes: notesReducer,
    auth: authReducer,
    chat: chatReducer,
    profile: profilReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;