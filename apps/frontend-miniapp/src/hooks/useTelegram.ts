import { useEffect, useState } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegram() {
  const [tg, setTg] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<string>('');

  useEffect(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      // Apply theme colors if desired
      webApp.setHeaderColor('#0A1628');
      webApp.setBackgroundColor('#0A1628');
      setTg(webApp);
      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }
      setInitData(webApp.initData || '');
    } else {
      // Mock for local testing
      console.warn('Telegram WebApp is running in mock browser mode');
      setUser({
        id: 12345678,
        first_name: 'Gagarin',
        last_name: 'Yuri',
        username: 'gagarin_yuri',
      });
      setInitData('mock_12345678_Gagarin Yuri_gagarin_yuri');
    }
  }, []);

  const closeWebApp = () => {
    if (tg) tg.close();
  };

  return {
    tg,
    user,
    initData,
    closeWebApp,
    isWebApp: !!(window as any).Telegram?.WebApp,
  };
}
