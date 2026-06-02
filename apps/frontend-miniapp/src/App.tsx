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



  return (
    <QueryClientProvider client={queryClient}>
      {/* iOS Background Glow Blobs */}
      <div className="ios-bg-glow-1" />
      <div className="ios-bg-glow-2" />
      <div className="ios-bg-glow-3" />

      <div className="flex flex-col min-h-screen max-w-md mx-auto relative pb-24 font-sans selection:bg-space-blue/30">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0A1628] border-b border-white/[0.04] py-4 px-5 flex items-center justify-between pt-[calc(1rem+env(safe-area-inset-top))]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight text-white">
              Atlas Fleet
            </span>
          </div>
          <button 
            onClick={() => setActiveTab('notifications')}
            className="relative p-1.5 text-space-gray hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-2.5 h-2.5 flex items-center justify-center" />
            )}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-grow relative z-10">
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
            <Dashboard />
          </div>
          <div className={activeTab === 'missions' ? 'block' : 'hidden'}>
            <Missions />
          </div>
          <div className={activeTab === 'starmap' ? 'block' : 'hidden'}>
            <StarMap />
          </div>
          <div className={activeTab === 'notifications' ? 'block' : 'hidden'}>
            <Notifications />
          </div>
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#0A1428]/72 backdrop-blur-[22px] border-t border-white/[0.06] px-3 py-2 flex justify-around shadow-[0_-12px_40px_rgba(0,0,0,0.35)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center relative py-1.5 w-20 select-none focus:outline-none"
          >
            {activeTab === 'dashboard' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/[0.05] rounded-[18px] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <Compass className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-space-blue' : 'text-space-gray'}`} />
            <span className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${activeTab === 'dashboard' ? 'text-space-blue' : 'text-space-gray'}`}>
              Главная
            </span>
          </button>
          
          {/* Tab 2: Missions */}
          <button
            onClick={() => setActiveTab('missions')}
            className="flex flex-col items-center relative py-1.5 w-20 select-none focus:outline-none"
          >
            {activeTab === 'missions' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/[0.05] rounded-[18px] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <Rocket className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'missions' ? 'text-space-blue' : 'text-space-gray'}`} />
            <span className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${activeTab === 'missions' ? 'text-space-blue' : 'text-space-gray'}`}>
              Миссии
            </span>
          </button>
          
          {/* Tab 3: StarMap */}
          <button
            onClick={() => setActiveTab('starmap')}
            className="flex flex-col items-center relative py-1.5 w-20 select-none focus:outline-none"
          >
            {activeTab === 'starmap' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/[0.05] rounded-[18px] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <Star className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'starmap' ? 'text-space-blue' : 'text-space-gray'}`} />
            <span className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${activeTab === 'starmap' ? 'text-space-blue' : 'text-space-gray'}`}>
              Карта
            </span>
          </button>
          
          {/* Tab 4: Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="flex flex-col items-center relative py-1.5 w-20 select-none focus:outline-none"
          >
            {activeTab === 'notifications' && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/[0.05] rounded-[18px] -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <div className="relative flex items-center justify-center">
              <Bell className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'notifications' ? 'text-space-blue' : 'text-space-gray'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-[#0A1628] z-20">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${activeTab === 'notifications' ? 'text-space-blue' : 'text-space-gray'}`}>
              Журнал
            </span>
          </button>

        </nav>
      </div>
    </QueryClientProvider>
  );
}
