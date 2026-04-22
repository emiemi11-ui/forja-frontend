import api from './client.js';

export const submitContact = (data) => api.post('/contact', data);
export const joinWaitlist = (data) => api.post('/waitlist', data);
export const getPublicSettings = () => api.get('/settings/public');
