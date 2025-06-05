import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from './store';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  createdAt: string;
  __v: number;
}

interface AuthState {
  token: string | null;
  username: string;
  email: string;
  password: string;
  roles: string[];
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  username: '',
  email: '',
  password: '',
  roles: ['User'],
  user: null,
  loading: false,
  isAuthenticated: false,
  token: null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    setPassword(state, action: PayloadAction<string>) {
      state.password = action.payload;
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setIsAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setUsername, setEmail, setPassword, setRoles, setUser, setLoading, setIsAuthenticated, setError } =
  authSlice.actions;

export const signup = (): AppThunk => async (dispatch, getState) => {
  const { username, email, password, roles } = getState().auth;

  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const response = await fetch('http://localhost:5000/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        roles: roles.length > 0 ? roles : ['User'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Signup failed');
    }

    const data = await response.json();
    dispatch(setUser(data));
    dispatch(setIsAuthenticated(true));
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unexpected error occurred during signup';
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};

export const login = (): AppThunk => async (dispatch, getState) => {
  const { email, password } = getState().auth;

  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    Cookies.remove('token');
    Cookies.remove('authData');
    Cookies.remove('prelogin');

    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const data = await response.json();
    Cookies.set('token', data.token, { expires: 1 });

    const userResponse = await fetch('http://localhost:5000/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    dispatch(setUser(userData));
    dispatch(setIsAuthenticated(true));
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unexpected error occurred during login';
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};

export const handleLogin = (): AppThunk => async (dispatch) => {
  Cookies.set('prelogin', 'attempt', { expires: 1 });
  dispatch(login());
};

export const checkAuth = () => (dispatch: (arg0: { payload: boolean; type: 'auth/setIsAuthenticated' }) => void) => {
  const token = Cookies.get('token');
  if (token) {
    dispatch(setIsAuthenticated(true));
  } else {
    dispatch(setIsAuthenticated(false));
  }
};

export default authSlice.reducer;