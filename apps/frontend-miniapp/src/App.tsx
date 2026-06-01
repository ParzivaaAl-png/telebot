import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import StarMap from './pages/StarMap';
import Notifications from './pages/Notifications';
import { Compass, Rocket, Star, Bell } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function App() {
  const { activeTab, setActiveTab, unreadCount } = useAppStore();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'missions':
        return <Missions />;
      case 'starmap':
        return <StarMap />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-space-bg pb-24">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-space-bg/85 backdrop-blur-md border-b border-white/5 py-4 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-space-blue shadow-glow-blue animate-pulse" />
            <span className="font-extrabold text-sm tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple">
              Atlas Fleet Control
            </span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-space-green shadow-glow-green" />
            <span className="text-space-gray">ONLINE</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow">
          {renderActiveScreen()}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-space-bg/95 backdrop-blur-lg border-t border-white/5 px-4 py-3 flex justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'dashboard' ? 'text-space-blue scale-105' : 'text-space-gray'}`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold">Главная</span>
          </button>
          
          <button
            onClick={() => setActiveTab('missions')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'missions' ? 'text-space-purple scale-105' : 'text-space-gray'}`}
          >
            <Rocket className="w-5 h-5" />
            <span className="text-[10px] font-bold">Миссии</span>
          </button>
          
          <button
            onClick={() => setActiveTab('starmap')}
            className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'starmap' ? 'text-space-blue scale-105' : 'text-space-gray'}`}
          >
            <Star className="w-5 h-5" />
            <span className="text-[10px] font-bold">Карта</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex flex-col items-center space-y-1 transition-all relative ${activeTab === 'notifications' ? 'text-space-green scale-105' : 'text-space-gray'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-bold">Журнал</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-space-bg animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </QueryClientProvider>
  );
}
