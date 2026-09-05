// File: src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import jobsReducer from '../features/jobs/jobsSlice';
import authReducer from '../features/auth/slice/authSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import feedReducer from '../features/feed/feedSlice';
import recruiterReducer from '../features/recruiter/recruiterSlice';
import messagingReducer from '../features/messaging/messagingSlice';
import jobFilterReducer from '../features/jobs/slice/jobFilterSlice';
import activeConversationsReducer from '../features/messaging/slice/activeConversationsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    jobFilters: jobFilterReducer,
    auth: authReducer,
    notifications: notificationsReducer,
    feed: feedReducer,
    recruiter: recruiterReducer,
    messaging: messagingReducer,
    activeConversations: activeConversationsReducer,
  },
});
