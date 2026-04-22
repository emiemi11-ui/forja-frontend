import api from './client.js';
import { ENDPOINTS } from './endpoints.js';

export const login = (email, password) =>
  api.post(ENDPOINTS.auth.login, { email, password });

export const register = (name, email, password, role, plan, inviteToken, extra, meta = {}) =>
  api.post(ENDPOINTS.auth.register, {
    name,
    email,
    password,
    role,
    plan,
    inviteToken,
    extra,
    adminBootstrapKey: meta.adminBootstrapKey,
  });

export const requestPasswordReset = (email) =>
  api.post('/auth/forgot-password', { email });
