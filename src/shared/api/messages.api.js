import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const getConversations = () => api.get(ENDPOINTS.messages.conversations);
export const startConversation = (targetUserId) => api.post(ENDPOINTS.messages.start, { targetUserId });
export const getConversation = (id) => api.get(ENDPOINTS.messages.detail(id));
export const sendDirectMessage = (id, message) => api.post(ENDPOINTS.messages.send(id), { message });
export const getUnreadCount = () => api.get(ENDPOINTS.messages.unreadCount);
