import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const getAdminOverview = () => api.get(ENDPOINTS.admin.overview);
export const getAdminUsers = (params = {}) => api.get(ENDPOINTS.admin.users, { params });
export const updateUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAdminInbox = () => api.get(ENDPOINTS.admin.inbox);
export const getAdminSettings = () => api.get(ENDPOINTS.admin.settings);
export const updateAdminSettings = (data) => api.put(ENDPOINTS.admin.settings, data);
export const getAdminAudit = (params = {}) => api.get(ENDPOINTS.admin.audit, { params });
