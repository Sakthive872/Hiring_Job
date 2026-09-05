// File: src/features/recruiter/recruiterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const recruiterSlice = createSlice({
  name: 'recruiter',
  initialState: { pipeline: [], status: 'idle', error: null },
  reducers: {
    setPipeline: (state, action) => {
      state.pipeline = Array.isArray(action.payload) ? action.payload : [];
      state.status = 'succeeded';
    },
    resetPipeline: (state) => {
      state.pipeline = [];
      state.status = 'idle';
      state.error = null;
    },
  },
});
export const { setPipeline, resetPipeline } = recruiterSlice.actions;
export default recruiterSlice.reducer;
