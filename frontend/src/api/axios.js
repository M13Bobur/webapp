import axios from 'axios';
import { apiBaseUrl, uploadsBaseUrl, isExternalApi } from '../config/env.js';

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
  headers: isExternalApi && apiBaseUrl.includes('ngrok')
    ? { 'ngrok-skip-browser-warning': 'true' }
    : {},
});

export const setTelegramAuth = (initData) => {
  if (initData) {
    api.defaults.headers.common['X-Telegram-Init-Data'] = initData;
  }
};

export const getImageUrl = (path) => {
  if (!path) return '/placeholder-food.jpg';
  if (path.startsWith('http')) return path;
  return `${uploadsBaseUrl}${path}`;
};
