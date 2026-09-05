// File: src/features/messaging/slice/activeConversationsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const activeConversationsSlice = createSlice({
  name: 'activeConversations',
  initialState: {
    activeId: null,
    conversations: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setActiveConversation: (state, action) => {
      state.activeId = action.payload;
    },
    appendMessage: (state, action) => {
      const conversation = state.conversations.find(
        (item) => item.id === action.payload.threadId,
      );
      if (conversation) {
        conversation.messages = [
          ...(conversation.messages || []),
          action.payload,
        ];
        conversation.lastMessage = action.payload;
      }
    },
    setConversationError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});
export const {
  setConversations,
  setActiveConversation,
  appendMessage,
  setConversationError,
} = activeConversationsSlice.actions;
export default activeConversationsSlice.reducer;
