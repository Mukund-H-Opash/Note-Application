// frontend/src/redux/userSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';
import Cookies from 'js-cookie';
import { setIsAuthenticated } from './authSlice';

interface User {
  _id: string;
  username: string;
  email: string;
}

interface UserState {
  allUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  allUsers: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    fetchAllUsersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAllUsersSuccess(state, action: PayloadAction<User[]>) {
      state.loading = false;
      state.allUsers = action.payload;
    },
    fetchAllUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchAllUsersStart, fetchAllUsersSuccess, fetchAllUsersFailure } = userSlice.actions;

export const fetchAllUsers = (): AppThunk => async (dispatch) => {
  dispatch(fetchAllUsersStart());
  try {
    const token = Cookies.get('token');
    if (!token) {
      dispatch(fetchAllUsersFailure('No token found in cookies'));
      dispatch(setIsAuthenticated(false));
      return;
    }

    const response = await fetch('http://localhost:5000/users/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        dispatch(setIsAuthenticated(false));
        throw new Error('Unauthorized: Invalid or expired token');
      }
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    dispatch(fetchAllUsersSuccess(data));
  } catch (error) {
    dispatch(fetchAllUsersFailure((error as Error).message));
  }
};

export default userSlice.reducer;