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
      {/* HUD System Overlay Elements */}
      <div className="hud-stars" />
      <div className="hud-grid" />
      <div className="hud-ambient-glow" />
      <div className="hud-scanline" />

      <div className="flex flex-col min-h-screen max-w-md mx-auto relative pb-24 font-exo">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-space-bg/80 backdrop-blur-md border-b border-space-blue/20 py-4 px-5 flex items-center justify-between shadow-[0_4px_20px_rgba(0,163,255,0.05)]">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-space-blue shadow-glow-blue animate-pulse" />
            <span className="font-orbitron font-black text-sm tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-space-blue via-space-white to-space-purple">
              ATLAS FLEET HUD
            </span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-space-blue/10 border border-space-blue/30 rounded-md text-[10px] font-orbitron font-bold tracking-wider text-space-blue">
            <span className="w-1.5 h-1.5 rounded-full bg-space-green shadow-glow-green animate-pulse" />
            <span>HUD: ONLINE</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow relative z-10">
          {renderActiveScreen()}
        </main>

        {/* Bottom Tab Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-space-bg/90 backdrop-blur-lg border-t border-space-blue/30 shadow-[0_-4px_25px_rgba(0,163,255,0.12)] px-2 py-2 flex justify-around">
          
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="nav-radar"
                  className="absolute inset-0 rounded-full border border-space-blue/40 bg-space-blue/5 shadow-[0_0_10px_rgba(0,163,255,0.25)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-space-blue/20 animate-spin" style={{ animationDuration: '6s' }} />
                </motion.div>
              )}
              <Compass className={`w-5 h-5 relative z-10 transition-colors duration-300 ${activeTab === 'dashboard' ? 'text-space-blue star-glow' : 'text-space-gray'}`} />
            </div>
            <span className={`text-[9px] font-orbitron tracking-wider mt-0.5 relative z-10 transition-colors duration-300 ${activeTab === 'dashboard' ? 'text-space-blue font-bold' : 'text-space-gray'}`}>
              ЦУП
            </span>
          </button>
          
          {/* Tab 2: Missions */}
          <button
            onClick={() => setActiveTab('missions')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              {activeTab === 'missions' && (
                <motion.div
                  layoutId="nav-radar"
                  className="absolute inset-0 rounded-full border border-space-purple/40 bg-space-purple/5 shadow-[0_0_10px_rgba(123,97,255,0.25)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-space-purple/20 animate-spin" style={{ animationDuration: '6s' }} />
                </motion.div>
              )}
              <Rocket className={`w-5 h-5 relative z-10 transition-colors duration-300 ${activeTab === 'missions' ? 'text-space-purple star-glow' : 'text-space-gray'}`} />
            </div>
            <span className={`text-[9px] font-orbitron tracking-wider mt-0.5 relative z-10 transition-colors duration-300 ${activeTab === 'missions' ? 'text-space-purple font-bold' : 'text-space-gray'}`}>
              МИССИИ
            </span>
          </button>
          
          {/* Tab 3: StarMap */}
          <button
            onClick={() => setActiveTab('starmap')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              {activeTab === 'starmap' && (
                <motion.div
                  layoutId="nav-radar"
                  className="absolute inset-0 rounded-full border border-space-blue/40 bg-space-blue/5 shadow-[0_0_10px_rgba(0,163,255,0.25)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-space-blue/20 animate-spin" style={{ animationDuration: '6s' }} />
                </motion.div>
              )}
              <Star className={`w-5 h-5 relative z-10 transition-colors duration-300 ${activeTab === 'starmap' ? 'text-space-blue star-glow' : 'text-space-gray'}`} />
            </div>
            <span className={`text-[9px] font-orbitron tracking-wider mt-0.5 relative z-10 transition-colors duration-300 ${activeTab === 'starmap' ? 'text-space-blue font-bold' : 'text-space-gray'}`}>
              КАРТА
            </span>
          </button>
          
          {/* Tab 4: Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="flex flex-col items-center relative py-1 w-16 transition-all"
          >
            <div className="relative p-2 flex items-center justify-center">
              {activeTab === 'notifications' && (
                <motion.div
                  layoutId="nav-radar"
                  className="absolute inset-0 rounded-full border border-space-green/40 bg-space-green/5 shadow-[0_0_10px_rgba(0,196,140,0.25)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-space-green/20 animate-spin" style={{ animationDuration: '6s' }} />
                </motion.div>
              )}
              <Bell className={`w-5 h-5 relative z-10 transition-colors duration-300 ${activeTab === 'notifications' ? 'text-space-green star-glow' : 'text-space-gray'}`} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[8px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center border border-space-bg z-20 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-orbitron tracking-wider mt-0.5 relative z-10 transition-colors duration-300 ${activeTab === 'notifications' ? 'text-space-green font-bold' : 'text-space-gray'}`}>
              ЖУРНАЛ
            </span>
          </button>

        </nav>
      </div>
    </QueryClientProvider>
  );
}
