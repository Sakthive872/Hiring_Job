// File: src/features/jobs/jobsSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from '../../services/api/axiosClient';

function normalizeJobs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/jobs', { params });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Jobs could not be loaded',
      );
    }
  },
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { items: [], status: 'idle', error: null, query: '' },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = normalizeJobs(action.payload);
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      }),
});
export const { setQuery } = jobsSlice.actions;
export default jobsSlice.reducer;
