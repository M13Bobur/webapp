import { useEffect, useState } from 'react';
import { setTelegramAuth } from '../api/axios';

export const useTelegram = () => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [initData, setInitData] = useState('');

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      setTg(webApp);
      setUser(webApp.initDataUnsafe?.user);
      setInitData(webApp.initData || '');
      setTelegramAuth(webApp.initData);

      const isDark = webApp.colorScheme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);

      webApp.setHeaderColor(isDark ? '#1f2937' : '#ffffff');
      webApp.setBackgroundColor(isDark ? '#111827' : '#f9fafb');
    }
  }, []);

  return { tg, user, initData };
};
