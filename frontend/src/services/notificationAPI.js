import api from './api';

export const notificationAPI = {
  subscribe: (data) => api.post('/notifications/subscribe', data),
  create: (data) => api.post('/notifications/create', data),
  getMy: () => api.get('/notifications/my'),
  markRead: (id) => api.patch(`/notifications/read/${id}`),
  unreadCount: () => api.get('/notifications/unread-count'),
  uploadImage: (formData) => api.post('/upload/image', formData),
};
