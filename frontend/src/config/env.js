/**
 * .env da VITE_BACKEND_URL yoki VITE_API_URL beriladi.
 *
 * VITE_BACKEND_URL=https://example.com  → API: .../api , rasmlar: .../
 * VITE_API_URL=https://example.com/api  → to'g'ridan-to'g'ri API bazasi
 */

const trim = (v) => (v || '').trim().replace(/\/$/, '');

export const backendUrl = trim(import.meta.env.VITE_BACKEND_URL);

export const apiBaseUrl = (() => {
  const apiUrl = trim(import.meta.env.VITE_API_URL);
  if (apiUrl) return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
  if (backendUrl) return `${backendUrl}/api`;
  return '/api';
})();

export const uploadsBaseUrl = (() => {
  const uploads = trim(import.meta.env.VITE_UPLOADS_URL);
  if (uploads) return uploads;
  if (backendUrl) return backendUrl;
  return '';
})();

export const isExternalApi = apiBaseUrl.startsWith('http');
