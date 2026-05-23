import { create } from 'zustand';
import { api } from '../api/axios';

export const useAuthStore = create((set) => ({
  admin: null,
  token: localStorage.getItem('admin_token'),

  login: async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token, admin } = res.data.data;
    localStorage.setItem('admin_token', token);
    set({ token, admin });
    return admin;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, admin: null });
  },

  fetchMe: async () => {
    const res = await api.get('/auth/me');
    set({ admin: res.data.data });
    return res.data.data;
  },
}));
