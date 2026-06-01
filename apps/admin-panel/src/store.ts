import { create } from 'zustand';

interface AdminState {
  token: string | null;
  username: string | null;
  activeTab: 'dashboard' | 'couriers' | 'import' | 'logs';
  selectedCourierId: string | null;
  setAuth: (token: string | null, username: string | null) => void;
  setActiveTab: (tab: 'dashboard' | 'couriers' | 'import' | 'logs') => void;
  setSelectedCourierId: (id: string | null) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  token: localStorage.getItem('admin_token'),
  username: localStorage.getItem('admin_username'),
  activeTab: 'dashboard',
  selectedCourierId: null,
  setAuth: (token, username) => {
    if (token) {
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_username', username || '');
    } else {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
    }
    set({ token, username });
  },
  setActiveTab: (tab) => set({ activeTab: tab, selectedCourierId: null }),
  setSelectedCourierId: (id) => set({ selectedCourierId: id }),
  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    set({ token: null, username: null, activeTab: 'dashboard', selectedCourierId: null });
  },
}));
