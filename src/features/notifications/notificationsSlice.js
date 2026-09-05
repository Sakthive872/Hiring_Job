// File: src/features/notifications/notificationsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0, status: 'idle' },
  reducers: {
    receiveNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unread += 1;
    },
    markAllRead: (state) => {
      state.unread = 0;
    },
  },
});
export const { receiveNotification, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
