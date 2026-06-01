import { create } from 'zustand';

interface AppState {
  activeTab: 'dashboard' | 'missions' | 'starmap' | 'notifications';
  setActiveTab: (tab: 'dashboard' | 'missions' | 'starmap' | 'notifications') => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
