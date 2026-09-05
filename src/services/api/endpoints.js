// File: src/services/api/endpoints.js
const endpoints = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  users: {
    me: '/users/me',
    byId: (userId) => `/users/${encodeURIComponent(userId)}`,
    connections: '/users/me/connections',
  },
  network: {
    profiles: '/network/profiles',
    connections: (userId) =>
      `/network/connections/${encodeURIComponent(userId)}`,
    request: '/network/connections/request',
    status: (connectionId) =>
      `/network/connections/${encodeURIComponent(connectionId)}/status`,
  },
  jobs: {
    list: '/jobs',
    byId: (jobId) => `/jobs/${encodeURIComponent(jobId)}`,
    apply: (jobId) => `/jobs/${encodeURIComponent(jobId)}/applications`,
    saved: '/jobs/saved',
  },
  companies: {
    list: '/companies',
    byId: (companyId) => `/companies/${encodeURIComponent(companyId)}`,
  },
  candidates: {
    list: '/candidates',
    byId: (candidateId) => `/candidates/${encodeURIComponent(candidateId)}`,
  },
  feed: {
    posts: '/feed/posts',
    byId: (postId) => `/feed/posts/${encodeURIComponent(postId)}`,
    comments: (postId) => `/feed/posts/${encodeURIComponent(postId)}/comments`,
    like: (postId) => `/feed/posts/${encodeURIComponent(postId)}/like`,
  },
  messages: {
    threads: '/messages/threads',
    messages: (threadId) =>
      `/messages/threads/${encodeURIComponent(threadId)}/messages`,
  },
  notifications: {
    list: '/notifications',
    read: (notificationId) =>
      `/notifications/${encodeURIComponent(notificationId)}/read`,
    readAll: '/notifications/read-all',
  },
  search: { universal: '/search' },
  assistant: {
    health: '/assistant/health',
    chat: '/assistant/chat',
  },
};
export default Object.freeze(endpoints);
