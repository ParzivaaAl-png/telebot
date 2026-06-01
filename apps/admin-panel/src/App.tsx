import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminStore } from './store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Couriers from './pages/Couriers';
import CourierDetails from './pages/CourierDetails';
import ImportCSV from './pages/ImportCSV';
import AuditLogs from './pages/AuditLogs';
import { Compass, Users, FileText, Database, LogOut, ShieldAlert } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const { token, username, activeTab, setActiveTab, selectedCourierId, logout } = useAdminStore();

  if (!token) {
    return (
      <QueryClientProvider client={queryClient}>
        <Login />
      </QueryClientProvider>
    );
  }

  const renderActiveTab = () => {
    if (selectedCourierId) {
      return <CourierDetails />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'couriers':
        return <Couriers />;
      case 'import':
        return <ImportCSV />;
      case 'logs':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-space-bg text-white">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-space-bg border-r border-white/5 flex flex-col justify-between sticky top-0 h-screen p-5">
          <div className="space-y-8">
            {/* Console Branding */}
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-space-blue shadow-glow-blue animate-pulse" />
              <span className="font-extrabold text-sm tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple">
                Atlas Command
              </span>
            </div>

            {/* Nav list */}
            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'dashboard' && !selectedCourierId ? 'bg-space-blue text-white shadow-glow-blue' : 'text-space-gray hover:bg-white/5 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Рабочий стол</span>
              </button>

              <button
                onClick={() => setActiveTab('couriers')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'couriers' || selectedCourierId ? 'bg-space-blue text-white shadow-glow-blue' : 'text-space-gray hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>База курьеров</span>
              </button>

              <button
                onClick={() => setActiveTab('import')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'import' && !selectedCourierId ? 'bg-space-blue text-white shadow-glow-blue' : 'text-space-gray hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Импорт CSV</span>
              </button>

              <button
                onClick={() => setActiveTab('logs')}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'logs' && !selectedCourierId ? 'bg-space-blue text-white shadow-glow-blue' : 'text-space-gray hover:bg-white/5 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Логи аудита</span>
              </button>
            </nav>
          </div>

          {/* User profile footer */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="flex items-center space-x-3 px-2">
              <div className="p-1.5 bg-space-purple/10 border border-space-purple/20 rounded-md text-space-purple text-xs font-bold font-mono">
                ADM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{username}</p>
                <p className="text-[10px] text-space-gray">Подключение активно</p>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Выйти из терминала</span>
            </button>
          </div>
        </aside>

        {/* Console view area */}
        <main className="flex-1 overflow-y-auto p-8 max-w-5xl">
          {renderActiveTab()}
        </main>
      </div>
    </QueryClientProvider>
  );
}
