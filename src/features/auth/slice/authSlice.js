// File: src/features/auth/slice/authSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getCurrentUser as requestCurrentUser,
  login as requestLogin,
  register as requestRegister,
} from '../../../lib/auth';
import {
  clearTokens,
  getAccessToken,
  getCurrentUser,
  setAccessToken,
  setCurrentUser,
  setRefreshToken,
} from '../../../services/storage/localStorage';

const initialState = {
  user: getCurrentUser(),
  role: getCurrentUser()?.role || null,
  status: getAccessToken() || getCurrentUser() ? 'authenticated' : 'anonymous',
  requestStatus: 'idle',
  error: null,
};
const getMessage = (error, fallback) => {
  const responseData = error.response?.data;
  const message =
    responseData?.message || responseData?.error || responseData?.detail;

  if (
    error.response?.status === 409 ||
    /already exists|duplicate|email.*taken/i.test(message || '')
  ) {
    return 'An account with this email already exists.';
  }

  if (
    error.response?.status === 401 ||
    /invalid|incorrect|credential|password|user not found|email not found|unexpected server error/i.test(
      message || '',
    )
  ) {
    return 'ID or password is incorrect.';
  }

  return message || fallback;
};
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await requestLogin(credentials);
      const user = data.user || data.account || data;
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setCurrentUser(user);
      return { ...data, user };
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Unable to sign in'));
    }
  },
);
export const signup = createAsyncThunk(
  'auth/signup',
  async (details, { rejectWithValue }) => {
    try {
      const data = await requestRegister({
        username: details.username || details.name,
        email: details.email,
        password: details.password,
        role: details.role,
      });
      const user = data.user || data.account || data;
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setCurrentUser(user);
      return { ...data, user };
    } catch (error) {
      return rejectWithValue(getMessage(error, 'Unable to create account'));
    }
  },
);
export const loadCurrentUser = createAsyncThunk(
  'auth/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await requestCurrentUser();
      setCurrentUser(user.user || user.account || user);
      return user.user || user.account || user;
    } catch (error) {
      clearTokens();
      setCurrentUser(null);
      return rejectWithValue(getMessage(error, 'Unable to verify session'));
    }
  },
);
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await axiosClient.post(endpoints.auth.logout);
    } finally {
      clearTokens();
      setCurrentUser(null);
      dispatch(clearSession());
    }
  },
);
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.user?.role || null;
      state.status = 'authenticated';
    },
    clearSession: (state) => {
      state.user = null;
      state.role = null;
      state.status = 'anonymous';
      state.requestStatus = 'idle';
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(login.pending, (state) => {
        state.requestStatus = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.requestStatus = 'succeeded';
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.role = action.payload.user?.role || action.payload.role || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.requestStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(signup.pending, (state) => {
        state.requestStatus = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.requestStatus = 'succeeded';
        state.status = 'authenticated';
        state.user = action.payload.user;
        state.role = action.payload.user?.role || action.payload.role || null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.requestStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.status = 'anonymous';
        state.requestStatus = 'idle';
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload?.role || null;
        state.status = 'authenticated';
      }),
});
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
