import { create } from 'zustand';

export const useToastStore = create((set) => ({
  message: '',
  visible: false,
  show: (message) => set({ message, visible: true }),
  hide: () => set({ visible: false, message: '' }),
}));
