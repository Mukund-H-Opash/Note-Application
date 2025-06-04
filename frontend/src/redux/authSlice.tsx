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
  token: any;
  username: string;
  email: string;
  password: string;
  roles: string[];
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  username: '',
  email: '',
  password: '',
  roles: ['User'],
  user: null,
  loading: false,
  isAuthenticated: false,
  token: undefined
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
  },
});

export const { setUsername, setEmail, setPassword, setRoles, setUser, setLoading, setIsAuthenticated } = authSlice.actions;

export const signup = (): AppThunk => async (dispatch, getState) => {
  const { username, email, password, roles } = getState().auth;

  dispatch(setLoading(true));
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
      throw new Error('Signup failed');
    }

    const data = await response.json();
    dispatch(setUser(data));
    dispatch(setIsAuthenticated(true));
    // console.log('Signup successful');
  } catch (error) {
    console.error('Signup error:', (error as Error).message);
  } finally {
    dispatch(setLoading(false));
  }
};

export const login = (): AppThunk => async (dispatch, getState) => {
  const { email, password } = getState().auth;

  dispatch(setLoading(true));
  try {
    // Clear existing cookies before saving new token
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
      throw new Error('Login failed');
    }

    const data = await response.json();
    document.cookie = `authData=${JSON.stringify(data)}; path=/; max-age=3600`;
    Cookies.set('token', data.token, { expires: 1 });
    dispatch(setUser(data));
    dispatch(setIsAuthenticated(true));
    // console.log('Login successful');
  } catch (error) {
    console.error('Login error:', (error as Error).message);
  } finally {
    dispatch(setLoading(false));
  }
};

export const handleLogin = (): AppThunk => async (dispatch) => {
  Cookies.set('prelogin', 'attempt', { expires: 1 });
  dispatch(login());
};

export const checkAuth = () => (dispatch: (arg0: { payload: boolean; type: "auth/setIsAuthenticated"; }) => void) => {
  const token = Cookies.get('token');
  if (token) {
    dispatch(setIsAuthenticated(true));
    // Optionally fetch user info
  } else {
    dispatch(setIsAuthenticated(false));
  }
};

export default authSlice.reducer;