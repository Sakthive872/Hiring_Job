// File: src/features/feed/feedSlice.js
import { createSlice } from '@reduxjs/toolkit';

const feedSlice = createSlice({
  name: 'feed',
  initialState: { posts: [], status: 'idle', error: null },
  reducers: {
    receivePost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    toggleLike: (state, action) => {
      const post = state.posts.find((item) => item.id === action.payload);
      if (post) post.liked = !post.liked;
    },
  },
});
export const { receivePost, toggleLike } = feedSlice.actions;
export default feedSlice.reducer;
