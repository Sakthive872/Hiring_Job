// File: src/features/search/api/searchApi.js
import axiosClient from '../../../services/api/axiosClient';
import endpoints from '../../../services/api/endpoints';

export async function searchAll(params, signal) {
  const { data } = await axiosClient.get(endpoints.search.universal, {
    params,
    signal,
  });
  return {
    jobs: data?.jobs || [],
    candidates: data?.candidates || [],
    companies: data?.companies || [],
    total: data?.total || 0,
  };
}
export function searchMessage(error) {
  return error.response?.data?.message || 'Search results could not be loaded';
}
