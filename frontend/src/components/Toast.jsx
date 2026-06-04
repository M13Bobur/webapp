import { useEffect } from 'react';
import { useToastStore } from '../store/toastStore';

export const Toast = () => {
  const { message, visible, hide } = useToastStore();

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(hide, 2200);
    return () => clearTimeout(timer);
  }, [visible, message, hide]);

  if (!visible || !message) return null;

  return (
    <div
      className="fixed left-4 right-4 z-[100] flex justify-center pointer-events-none"
      style={{ top: 'max(1rem, env(safe-area-inset-top, 0px))' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 rounded-xl bg-gray-900/95 px-4 py-3 text-sm font-medium text-white shadow-lg backdrop-blur dark:bg-gray-800/95">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
          ✓
        </span>
        {message}
      </div>
    </div>
  );
};
