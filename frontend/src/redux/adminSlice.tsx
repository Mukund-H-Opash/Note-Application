import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: string;
  __v: number;
}

interface AdminState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    fetchUsersStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess(state, action: PayloadAction<User[]>) {
      state.loading = false;
      state.users = action.payload;
    },
    fetchUsersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchUsersStart, fetchUsersSuccess, fetchUsersFailure } = adminSlice.actions;

export const fetchUsers = (): AppThunk => async (dispatch) => {
  dispatch(fetchUsersStart());
  try {
    const response = await fetch('http://localhost:5000/admin');
    const data = await response.json();
    dispatch(fetchUsersSuccess(data));
  } catch (error) {
    dispatch(fetchUsersFailure((error as Error).message));
  }
};

export default adminSlice.reducer;