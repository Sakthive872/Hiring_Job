// File: src/features/recruiter/api/recruiterApi.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';
import { setPipeline } from '../recruiterSlice';

const unwrapItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.candidates)) return data.candidates;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};
const messageFrom = (error, fallback) =>
  error.response?.data?.message || fallback;
export const fetchPipeline = createAsyncThunk(
  'recruiter/fetchPipeline',
  async (params = {}, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(endpoints.candidates.list, {
        params,
      });
      const items = unwrapItems(data);
      dispatch(setPipeline(items));
      return items;
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Candidate pipeline could not be loaded'),
      );
    }
  },
);
export const updateCandidateStage = createAsyncThunk(
  'recruiter/updateCandidateStage',
  async ({ candidateId, stage }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.patch(
        `${endpoints.candidates.byId(candidateId)}/stage`,
        { stage },
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        messageFrom(error, 'Candidate stage could not be updated'),
      );
    }
  },
);
export const postJob = createAsyncThunk(
  'recruiter/postJob',
  async (job, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post(endpoints.jobs.list, job);
      return data;
    } catch (error) {
      return rejectWithValue(messageFrom(error, 'Job could not be posted'));
    }
  },
);
