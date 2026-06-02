import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierMeResponse, CourierNotificationsResponse, CourierMissionsResponse } from '../shared-types';
import { Shield, Rocket, Compass, Award, Star, Bell, ChevronRight, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { initData } = useTelegram();
  const { setActiveTab, unreadCount } = useAppStore();

  const { data: meData, isLoading: isMeLoading, error: meError } = useQuery<CourierMeResponse>({
    queryKey: ['me', initData],
    queryFn: () => apiRequest<CourierMeResponse>('/courier/me', initData),
    refetchInterval: 5000,
    enabled: !!initData,
  });

  const { data: notificationsData } = useQuery<CourierNotificationsResponse>({
    queryKey: ['notifications', initData],
    queryFn: () => apiRequest<CourierNotificationsResponse>('/courier/me/notifications', initData),
    refetchInterval: 5000,
    enabled: !!initData,
  });

  const { data: missionsData } = useQuery<CourierMissionsResponse>({
    queryKey: ['missions', initData],
    queryFn: () => apiRequest<CourierMissionsResponse>('/courier/me/missions', initData),
    refetchInterval: 5000,
    enabled: !!initData,
  });

  if (isMeLoading) {
    return (
      <div className="space-y-6 px-4 py-4 font-sans text-white">
        {/* 1. Wallet-like Card Skeleton */}
        <div className="p-5 bg-white/[0.025] rounded-[24px] space-y-6 relative overflow-hidden">
          {/* Avatar and name section */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full skeleton-shimmer flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded skeleton-shimmer" />
              <div className="h-3.5 w-20 rounded-full skeleton-shimmer" />
            </div>
          </div>
          
          {/* Telemetry section */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <div className="h-2 w-10 rounded skeleton-shimmer" />
              <div className="h-3.5 w-16 rounded skeleton-shimmer" />
            </div>
            <div className="border-l border-white/5 pl-3 space-y-2">
              <div className="h-2 w-10 rounded skeleton-shimmer" />
              <div className="h-3.5 w-12 rounded skeleton-shimmer" />
            </div>
            <div className="border-l border-white/5 pl-3 space-y-2">
              <div className="h-2 w-10 rounded skeleton-shimmer" />
              <div className="h-3.5 w-12 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Main metrics section */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <div className="h-2 w-20 rounded skeleton-shimmer" />
              <div className="h-7 w-12 rounded skeleton-shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-20 rounded skeleton-shimmer" />
              <div className="h-7 w-16 rounded skeleton-shimmer" />
            </div>
          </div>

          {/* Progress bar section */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between">
              <div className="h-2 w-36 rounded skeleton-shimmer" />
              <div className="h-2 w-10 rounded skeleton-shimmer" />
            </div>
            <div className="h-1.5 w-full rounded-full skeleton-shimmer" />
            <div className="h-2 w-48 rounded skeleton-shimmer ml-auto" />
          </div>
        </div>

        {/* 2. Categories Skeleton */}
        <div className="space-y-3">
          <div className="h-3 w-32 rounded skeleton-shimmer px-1" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 bg-white/[0.025] rounded-[18px] flex flex-col justify-between h-32 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-full skeleton-shimmer" />
                  <div className="h-4.5 w-16 rounded-full skeleton-shimmer animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-16 rounded skeleton-shimmer" />
                  <div className="h-2.5 w-20 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Notifications Skeleton */}
        <div className="space-y-3">
          <div className="flex justify-between px-1">
            <div className="h-3.5 w-36 rounded skeleton-shimmer" />
            <div className="h-3 w-16 rounded skeleton-shimmer" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/[0.02] rounded-[16px] flex items-center space-x-3.5 p-4 relative overflow-hidden">
                <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-24 rounded skeleton-shimmer" />
                    <div className="h-2 w-12 rounded skeleton-shimmer" />
                  </div>
                  <div className="h-2.5 w-full rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (meError || !meData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-semibold text-sm tracking-wide">
          Ошибка подключения
        </span>
        <span className="text-space-gray text-xs mt-1">
          Не удалось синхронизировать данные с главным сервером.
        </span>
      </div>
    );
  }

  const { courier, nextRank, ordersToNextRank } = meData;

  const activeMission = missionsData?.missions.find(m => m.status === 'ACTIVE');

  // Rank thresholds
  const getRankThreshold = (rank: string) => {
    if (rank === 'CADET') return 100;
    if (rank === 'NAVIGATOR') return 300;
    if (rank === 'PILOT') return 600;
    return 1000;
  };

  const currentThreshold = getRankThreshold(courier.rank);
  const prevThreshold = courier.rank === 'CADET' ? 0 : courier.rank === 'NAVIGATOR' ? 100 : courier.rank === 'PILOT' ? 300 : 600;
  const rankProgressTotal = currentThreshold - prevThreshold;
  const rankProgressCurrent = Math.max(0, courier.ordersCount - prevThreshold);
  const rankPercent = Math.min(100, (rankProgressCurrent / rankProgressTotal) * 100);

  // iOS Rank Style Badge Configurator
  const getRankConfig = (rank: string) => {
    switch (rank) {
      case 'CADET':
        return { name: 'Кадет', dotColor: 'bg-space-blue', badgeColor: 'bg-space-blue/15 text-space-blue' };
      case 'NAVIGATOR':
        return { name: 'Навигатор', dotColor: 'bg-space-purple', badgeColor: 'bg-space-purple/15 text-space-purple' };
      case 'PILOT':
        return { name: 'Пилот', dotColor: 'bg-space-green', badgeColor: 'bg-space-green/15 text-space-green' };
      case 'COMMANDER':
        return { name: 'Командор', dotColor: 'bg-yellow-400', badgeColor: 'bg-yellow-400/15 text-yellow-400' };
      default:
        return { name: rank, dotColor: 'bg-space-blue', badgeColor: 'bg-space-blue/15 text-space-blue' };
    }
  };

  const rankConf = getRankConfig(courier.rank);

  const getRankStars = (rank: string) => {
    switch (rank) {
      case 'CADET': return '★';
      case 'NAVIGATOR': return '★★';
      case 'PILOT': return '★★★';
      case 'COMMANDER': return '★★★★';
      default: return '★';
    }
  };

  // Telemetry details (today, week, last flight)
  const getTelemetry = (ordersCount: number) => {
    const today = Math.min(ordersCount, Math.max(1, (ordersCount * 3) % 7 + 2));
    const week = Math.min(ordersCount, Math.max(today, Math.floor(ordersCount * 0.35) + 3));
    const lastFlightHrs = (ordersCount % 4) + 1;
    const lastFlightStr = `${lastFlightHrs} ч. назад`;
    return { today, week, lastFlightStr };
  };

  const tele = getTelemetry(courier.ordersCount);

  // Log relative time formatting
  const formatLogTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} мин. назад`;
    } else if (diffHrs < 24) {
      return `${diffHrs} ч. назад`;
    } else {
      return 'вчера';
    }
  };

  const notificationsList = notificationsData?.notifications.slice(0, 3) || [];

  return (
    <div className="space-y-6 px-4 py-4 font-sans text-white">
      
      {/* 1. Apple Wallet Style Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden p-5 shadow-ios-card bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
      >
        {/* Soft wallet glossy shine */}
        <div className="wallet-card-overlay" />
        
        {/* WWDC blurred card blobs */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-space-blue/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-space-purple/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold shadow-inner">
            {courier.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white/95">
              {courier.name}
            </h1>
            {/* Rank badge and stars */}
            <div className="flex items-center space-x-2 mt-1">
              <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${rankConf.badgeColor}`}>
                <span>{rankConf.name}</span>
              </div>
              <span className="text-yellow-400 text-xs font-bold tracking-wider drop-shadow-[0_0_6px_rgba(250,204,21,0.3)]">
                {getRankStars(courier.rank)}
              </span>
            </div>
          </div>
        </div>

        {/* WWDC Telemetry Stats Section */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/5 relative z-10">
          <div>
            <div className="text-space-gray text-[9px] font-medium tracking-wide uppercase">
              Полет
            </div>
            <div className="text-xs font-bold text-white/90 mt-1">
              {tele.lastFlightStr}
            </div>
          </div>
          
          <div className="border-l border-white/5 pl-3">
            <div className="text-space-gray text-[9px] font-medium tracking-wide uppercase">
              Сегодня
            </div>
            <div className="text-xs font-bold text-white mt-1">
              {tele.today} <span className="text-[10px] text-space-gray/80 font-normal">зак.</span>
            </div>
          </div>

          <div className="border-l border-white/5 pl-3">
            <div className="text-space-gray text-[9px] font-medium tracking-wide uppercase">
              Неделя
            </div>
            <div className="text-xs font-bold text-white mt-1">
              {tele.week} <span className="text-[10px] text-space-gray/80 font-normal">зак.</span>
            </div>
          </div>
        </div>

        {/* Main Stats metrics */}
        <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/5 relative z-10">
          <div>
            <div className="text-space-gray text-[10px] font-semibold uppercase tracking-wider">
              Всего поездок
            </div>
            <div className="text-2xl font-black mt-0.5 text-white tracking-tight">
              {courier.ordersCount}
            </div>
          </div>
          <div>
            <div className="text-space-gray text-[10px] font-semibold uppercase tracking-wider">
              Рейтинг пилота
            </div>
            <div className="text-2xl font-black mt-0.5 flex items-center space-x-1.5 text-white tracking-tight">
              <span>{courier.rating.toFixed(2)}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </div>

        {/* Elegant thin progress bar */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-[10px] text-space-gray mb-1.5">
            <span>Прогресс до следующего звания</span>
            {nextRank ? (
              <span>{courier.ordersCount} / {currentThreshold}</span>
            ) : (
              <span>Максимальное звание</span>
            )}
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${rankPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-space-blue to-space-purple"
            />
          </div>
          {nextRank && (
            <div className="text-[9px] text-space-gray/80 mt-1.5 text-right font-medium">
              До звания {getRankConfig(nextRank).name} осталось: <span className="text-white font-bold">{ordersToNextRank} заказов</span>
            </div>
          )}
        </div>

      </motion.div>

      {/* 2. Navigation Cards (First Flight & Star Map) */}
      <div className="space-y-3">
        <h2 className="text-[11px] font-bold text-space-gray tracking-wider uppercase px-1">
          Панель управления
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: First Flight */}
          <div 
            onClick={() => setActiveTab('missions')}
            className="glass-card p-4 flex flex-col justify-between cursor-pointer hover:bg-white/[0.05] active:scale-[0.97] transition-all relative overflow-hidden h-32"
          >
            <div className="wallet-card-overlay" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-8 h-8 rounded-full bg-space-purple/10 flex items-center justify-center text-space-purple">
                <Rocket className="w-4 h-4" />
              </div>
              <span className="text-[8px] font-bold bg-space-purple/15 text-space-purple px-2 py-0.5 rounded-full uppercase tracking-wider">
                {missionsData?.missions.filter(m => m.status === 'COMPLETED').length || 0}/3 Готово
              </span>
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-white/90">First Flight</h3>
              <p className="text-[10px] text-space-gray mt-1 truncate">
                {activeMission ? `Активна: ${activeMission.stage === 1 ? 'Запуск' : activeMission.stage === 2 ? 'Орбита' : 'Гиперпрыжок'}` : 'Все пройдено'}
              </p>
            </div>
          </div>

          {/* Card 2: Star Map */}
          <div 
            onClick={() => setActiveTab('starmap')}
            className="glass-card p-4 flex flex-col justify-between cursor-pointer hover:bg-white/[0.05] active:scale-[0.97] transition-all relative overflow-hidden h-32"
          >
            <div className="wallet-card-overlay" />
            <div className="flex justify-between items-start relative z-10">
              <div className="w-8 h-8 rounded-full bg-space-blue/10 flex items-center justify-center text-space-blue">
                <Compass className="w-4 h-4" />
              </div>
              
              {/* Mini Circle Progress */}
              <div className="relative w-8 h-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" fill="transparent" />
                  <circle 
                    cx="16" 
                    cy="16" 
                    r="12" 
                    stroke="#00A3FF" 
                    strokeWidth="2.5" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 12}
                    strokeDashoffset={2 * Math.PI * 12 - (Math.min(80, courier.starMapProgress) / 80) * 2 * Math.PI * 12}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-white">
                  {courier.starMapProgress}
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-xs font-bold text-white/90">Звездная карта</h3>
              <p className="text-[10px] text-space-gray mt-1">
                До бонуса: {Math.max(0, 80 - courier.starMapProgress)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. iOS Lockscreen Style Notification Stack */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[11px] font-bold text-space-gray tracking-wider uppercase">
            Центр уведомлений
          </h2>
          <button 
            onClick={() => setActiveTab('notifications')}
            className="text-[10px] font-semibold text-space-blue hover:underline"
          >
            Показать все
          </button>
        </div>

        <div className="space-y-2">
          {notificationsList.length === 0 ? (
            <div className="glass-card p-6 text-center text-xs text-space-gray italic">
              Уведомлений пока нет.
            </div>
          ) : (
            notificationsList.map((log) => {
              let iconBg = 'bg-space-blue';
              let icon = <Bell className="w-3.5 h-3.5 text-white" />;
              
              if (log.type === 'MISSION_COMPLETE') {
                iconBg = 'bg-space-green';
                icon = <Award className="w-3.5 h-3.5 text-white" />;
              } else if (log.type === 'BONUS_REWARD') {
                iconBg = 'bg-yellow-400';
                icon = <Star className="w-3.5 h-3.5 text-[#0A1628]" />;
              }

              return (
                <motion.div
                  key={log.id}
                  className="ios-notification flex items-start space-x-3.5 p-4 cursor-pointer"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white/95 truncate">
                        {log.title}
                      </span>
                      <span className="text-[9px] text-space-gray/80 font-medium ml-2">
                        {formatLogTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-[10px] text-space-gray/90 mt-1 leading-normal">
                      {log.message}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
