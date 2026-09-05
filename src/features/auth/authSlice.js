// File: src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, role: null, status: 'anonymous' },
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
      sessionStorage.clear();
    },
  },
});
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
