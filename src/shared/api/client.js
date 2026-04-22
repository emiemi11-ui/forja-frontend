import axios from 'axios';
import {
  getStoredToken,
  clearStoredAuth,
  isDemoSession,
  readStoredUser,
} from '../../features/auth/model/authStorage.js';
import { mockRoute } from './mockData.js';

const API_URL = import.meta.env.VITE_API_URL || null;
const ENV_MOCK_MODE = import.meta.env.VITE_ENABLE_MOCKS === 'true';
const baseURL = API_URL ? `${API_URL}/api` : '/api';

const api = axios.create({ baseURL, timeout: 12000 });

function shouldUseMockMode() {
  // Always use mocks when no explicit backend URL is configured
  if (!API_URL) return true;
  const storedUser = readStoredUser();
  return ENV_MOCK_MODE || isDemoSession() || storedUser?.isDemo === true;
}

api.interceptors.request.use((cfg) => {
  const token = getStoredToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;

  if (!shouldUseMockMode()) {
    return cfg;
  }

  const method = (cfg.method || 'get').toUpperCase();
  const url = cfg.url || '';
  let body = null;
  try {
    body = cfg.data ? (typeof cfg.data === 'string' ? JSON.parse(cfg.data) : cfg.data) : null;
  } catch {
    body = cfg.data;
  }

  const mockData = mockRoute(method, url, body, cfg.params);

  if (mockData?.error) {
    const err = new Error('Mock API error');
    err.response = { status: 401, data: mockData };
    return Promise.reject(err);
  }

  cfg.adapter = () => Promise.resolve({
    data: mockData,
    status: 200,
    statusText: 'OK (mock)',
    headers: {},
    config: cfg,
  });

  return cfg;
});

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (shouldUseMockMode()) {
      return Promise.reject(err);
    }

    const path = err.config?.url || '';
    const isAuthRequest = path.includes('/auth/login') || path.includes('/auth/register');

    if (err.response?.status === 401 && !isAuthRequest) {
      clearStoredAuth();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(err);
  },
);

export default api;
