import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../services/authApi';

// Async Thunk to handle Login POST request
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const data = await authApi.login(email, password);
      if (!data || data.role !== 'admin') {
        return thunkAPI.rejectWithValue('Access denied. Only administrators are allowed to enter.');
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Retrieve initial session from local storage using admin keys
const initialUser = (() => {
  try {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
})();

const initialToken = (() => {
  try {
    return localStorage.getItem('admin_token') || null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken && initialUser?.role === 'admin',
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      try {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      } catch (err) {
        // Ignore storage errors
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem('admin_user', JSON.stringify(state.user));
      } catch (err) {
        // Ignore storage errors
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role
        };
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        try {
          localStorage.setItem('admin_token', action.payload.token);
          localStorage.setItem('admin_user', JSON.stringify(state.user));
        } catch (err) {
          // Ignore storage errors
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        try {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
        } catch (err) {
          // Ignore storage errors
        }
      });
  }
});

export const { logout, clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
