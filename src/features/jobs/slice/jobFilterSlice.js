// File: src/features/jobs/slice/jobFilterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  keyword: '',
  location: '',
  workplaceType: '',
  employmentType: '',
  experienceLevel: '',
  page: 1,
};
const jobFilterSlice = createSlice({
  name: 'jobFilters',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      Object.assign(state, action.payload, { page: action.payload.page || 1 });
    },
    setFilter: (state, action) => {
      state[action.payload.key] = action.payload.value;
      state.page = 1;
    },
    clearFilters: () => initialState,
    setPage: (state, action) => {
      state.page = action.payload;
    },
  },
});
export const { setFilters, setFilter, clearFilters, setPage } =
  jobFilterSlice.actions;
export default jobFilterSlice.reducer;
