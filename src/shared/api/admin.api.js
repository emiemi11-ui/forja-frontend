import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const getAdminOverview = () => api.get(ENDPOINTS.admin.overview);
export const getAdminUsers = (params = {}) => api.get(ENDPOINTS.admin.users, { params });
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminInbox = () => api.get(ENDPOINTS.admin.inbox);
export const markInboxRead = (id) => api.patch(`/admin/inbox/${id}/read`);
export const markAllInboxRead = () => api.post('/admin/inbox/mark-all-read');
export const toggleInboxResolved = (id) => api.patch(`/admin/inbox/${id}/resolve`);
export const getAdminSettings = () => api.get(ENDPOINTS.admin.settings);
export const updateAdminSettings = (data) => api.put(ENDPOINTS.admin.settings, data);
export const getAdminAudit = (params = {}) => api.get(ENDPOINTS.admin.audit, { params });

// Password reset admin endpoints
export const getPasswordResetRequests = () => api.get('/admin/password-resets');
export const generateTempPassword = (userId) => api.post(`/admin/password-resets/${userId}/generate`);
