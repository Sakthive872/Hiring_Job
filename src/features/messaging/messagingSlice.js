// File: src/features/messaging/messagingSlice.js
import { createSlice } from '@reduxjs/toolkit';

const messagingSlice = createSlice({
  name: 'messaging',
  initialState: {
    threads: [],
    activeThreadId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setThreads: (state, action) => {
      state.threads = action.payload;
      state.status = 'succeeded';
    },
    setActiveThread: (state, action) => {
      state.activeThreadId = action.payload;
    },
    receiveMessage: (state, action) => {
      const thread = state.threads.find(
        (item) => item.id === action.payload.threadId,
      );
      if (thread) thread.lastMessage = action.payload;
    },
  },
});
export const { setThreads, setActiveThread, receiveMessage } =
  messagingSlice.actions;
export default messagingSlice.reducer;
