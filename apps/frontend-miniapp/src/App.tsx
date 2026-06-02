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
        <header className="sticky top-0 z-40 bg-[#0A1628] border-b border-white/[0.04] py-4 px-5 flex items-center pt-[calc(1rem+env(safe-area-inset-top))]">
          <span className="font-bold text-base tracking-tight text-white">
            Atlas Fleet
          </span>
        </header>

        {/* Content Area — gentle fade-in per section. Safe now that the cards
            are static panels (no live backdrop-filter): fading the wrapper can
            no longer trigger the WebKit blur black-flash. Keying on activeTab
            remounts + re-runs the fade on every tab switch. */}
        <main className="flex-grow relative z-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {renderActiveScreen()}
          </motion.div>
        </main>

        {/* Bottom Tab Bar — floating capsule above Home Indicator */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4" style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 8px))' }}>
          <div className="bg-[#1A2235]/95 rounded-2xl px-2 py-1.5 flex justify-around shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          
            {/* Tab 1: Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex flex-col items-center relative py-1.5 w-20 select-none focus:outline-none"
            >
              {activeTab === 'dashboard' && (
                <motion.div
                  layoutId="active-nav-pill"
                  className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
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
                  className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
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
                  className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
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
                  className="absolute inset-0 bg-white/10 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <Bell className={`w-5 h-5 transition-colors duration-200 ${activeTab === 'notifications' ? 'text-space-blue' : 'text-space-gray'}`} />
              <span className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${activeTab === 'notifications' ? 'text-space-blue' : 'text-space-gray'}`}>
                Журнал
              </span>
            </button>

          </div>
        </nav>
      </div>
    </QueryClientProvider>
  );
}
