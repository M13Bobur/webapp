import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

const trimSlash = (v) => (v || '').trim().replace(/\/$/, '');

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  let normalized = String(path).trim();
  if (!normalized.startsWith('/')) {
    normalized = normalized.startsWith('uploads/') ? `/${normalized}` : `/uploads/${normalized}`;
  }

  const base =
    trimSlash(import.meta.env.VITE_UPLOADS_URL) ||
    trimSlash(import.meta.env.VITE_BACKEND_URL) ||
    '';
  return base ? `${base}${normalized}` : normalized;
};
