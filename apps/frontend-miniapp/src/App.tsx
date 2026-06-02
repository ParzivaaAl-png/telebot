import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from './store';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import StarMap from './pages/StarMap';
import Notifications from './pages/Notifications';
import { Compass, Rocket, Star, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

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
      {/* iOS Background Glow Blobs */}
      <div className="ios-bg-glow-1" />
      <div className="ios-bg-glow-2" />
      <div className="ios-bg-glow-3" />

      <div className="flex flex-col min-h-screen max-w-md mx-auto relative pb-24 font-sans selection:bg-space-blue/30">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0A1628]/60 backdrop-blur-md border-b border-white/5 py-4 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight text-white animate-pulse">
              Atlas Fleet
            </span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-semibold text-white/95">
            <span className="w-1.5 h-1.5 rounded-full bg-space-green animate-pulse" />
            <span>Online</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow relative z-10">
          {renderActiveScreen()}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#0A1628]/70 backdrop-blur-xl border-t border-white/5 px-2 py-2 flex justify-around">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              <Compass className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-space-blue' : 'text-space-gray'}`} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide relative z-10 transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-space-blue font-semibold' : 'text-space-gray'}`}>
              Главная
            </span>
            {activeTab === 'dashboard' && (
              <motion.div
                layoutId="active-nav-dot"
                className="absolute bottom-0 w-1 h-1 rounded-full bg-space-blue shadow-glow-blue"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
          
          {/* Tab 2: Missions */}
          <button
            onClick={() => setActiveTab('missions')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              <Rocket className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'missions' ? 'text-space-purple' : 'text-space-gray'}`} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide relative z-10 transition-colors duration-200 ${activeTab === 'missions' ? 'text-space-purple font-semibold' : 'text-space-gray'}`}>
              Миссии
            </span>
            {activeTab === 'missions' && (
              <motion.div
                layoutId="active-nav-dot"
                className="absolute bottom-0 w-1 h-1 rounded-full bg-space-purple shadow-glow-purple"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
          
          {/* Tab 3: StarMap */}
          <button
            onClick={() => setActiveTab('starmap')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              <Star className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'starmap' ? 'text-space-blue' : 'text-space-gray'}`} />
            </div>
            <span className={`text-[9px] font-medium tracking-wide relative z-10 transition-colors duration-200 ${activeTab === 'starmap' ? 'text-space-blue font-semibold' : 'text-space-gray'}`}>
              Карта
            </span>
            {activeTab === 'starmap' && (
              <motion.div
                layoutId="active-nav-dot"
                className="absolute bottom-0 w-1 h-1 rounded-full bg-space-blue shadow-glow-blue"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
          
          {/* Tab 4: Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              <Bell className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'notifications' ? 'text-space-green' : 'text-space-gray'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-[#0A1628] z-20">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-medium tracking-wide relative z-10 transition-colors duration-200 ${activeTab === 'notifications' ? 'text-space-green font-semibold' : 'text-space-gray'}`}>
              Журнал
            </span>
            {activeTab === 'notifications' && (
              <motion.div
                layoutId="active-nav-dot"
                className="absolute bottom-0 w-1 h-1 rounded-full bg-space-green shadow-glow-green"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>

        </nav>
      </div>
    </QueryClientProvider>
  );
}
