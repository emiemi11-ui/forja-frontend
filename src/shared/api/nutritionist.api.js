import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const getNutOverview = () => api.get(ENDPOINTS.nutritionist.overview);
export const getNutClients = () => api.get(ENDPOINTS.nutritionist.clients);
export const getNutClient = (id) => api.get(`${ENDPOINTS.nutritionist.clients}/${id}`);
export const getNutTemplates = () => api.get(ENDPOINTS.nutritionist.templates);
export const nutCreateClient = (data) => api.post(ENDPOINTS.nutritionist.clients, data);
export const nutCreateTemplate = (data) => api.post(ENDPOINTS.nutritionist.templates, data);
export const nutApplyTemplate = (id, clientIds) =>
  api.post(`${ENDPOINTS.nutritionist.templates}/${id}/apply`, { clientIds });
export const nutInviteClient = (data) => api.post(ENDPOINTS.nutritionist.clients + '/invite', data);

// ─── Nutritionist requests ───────────────────────────────────────────────────
export const getNutritionistRequests = () => api.get('/nutritionist/requests');
export const acceptNutritionistRequest = (linkId) => api.post(`/nutritionist/requests/${linkId}/accept`);
export const rejectNutritionistRequest = (linkId) => api.post(`/nutritionist/requests/${linkId}/reject`);
