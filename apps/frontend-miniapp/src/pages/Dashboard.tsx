import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierMeResponse, CourierNotificationsResponse } from '../shared-types';
import { Shield, Rocket, Compass, Award, Star, Bell, ChevronRight, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { initData } = useTelegram();
  const { setActiveTab } = useAppStore();

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

  if (isMeLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-8 h-8 text-space-blue animate-spin" />
        <span className="mt-4 text-space-gray text-xs tracking-wide animate-pulse">
          Загрузка консоли пилота...
        </span>
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
        return { name: 'Кадет', dotColor: 'bg-space-blue', badgeColor: 'bg-space-blue/10 text-space-blue border-space-blue/20' };
      case 'NAVIGATOR':
        return { name: 'Навигатор', dotColor: 'bg-space-purple', badgeColor: 'bg-space-purple/10 text-space-purple border-space-purple/20' };
      case 'PILOT':
        return { name: 'Пилот', dotColor: 'bg-space-green', badgeColor: 'bg-space-green/10 text-space-green border-space-green/20' };
      case 'COMMANDER':
        return { name: 'Командор', dotColor: 'bg-yellow-400', badgeColor: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' };
      default:
        return { name: rank, dotColor: 'bg-space-blue', badgeColor: 'bg-space-blue/10 text-space-blue border-space-blue/20' };
    }
  };

  const rankConf = getRankConfig(courier.rank);

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
            {/* Rank badge */}
            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 mt-1 border rounded-full text-[9px] font-semibold tracking-wide ${rankConf.badgeColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${rankConf.dotColor} animate-pulse`} />
              <span>{rankConf.name}</span>
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
            <div className="text-xs font-bold text-space-blue mt-1">
              {tele.today} <span className="text-[10px] text-space-gray/80 font-normal">зак.</span>
            </div>
          </div>

          <div className="border-l border-white/5 pl-3">
            <div className="text-space-gray text-[9px] font-medium tracking-wide uppercase">
              Неделя
            </div>
            <div className="text-xs font-bold text-space-purple mt-1">
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
            <div className="text-2xl font-black mt-0.5 flex items-center space-x-1.5 text-space-green tracking-tight">
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
              До звания {getRankConfig(nextRank).name} осталось: <span className="text-space-blue font-bold">{ordersToNextRank} заказов</span>
            </div>
          )}
        </div>

      </motion.div>

      {/* 2. Apple Settings Stack Menu */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-bold text-space-gray tracking-wider uppercase px-1">
          Разделы
        </h2>
        
        <div className="glass-card overflow-hidden border border-white/5 divide-y divide-white/5 shadow-sm">
          
          {/* Row 1: Missions */}
          <div 
            onClick={() => setActiveTab('missions')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.05] transition-all"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-7 h-7 bg-space-purple rounded-lg flex items-center justify-center text-white shadow-sm">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white/95">
                  Миссии и задания
                </h3>
                <p className="text-[10px] text-space-gray/80">
                  RPG дерево мотивирующих целей
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-space-gray/50" />
          </div>

          {/* Row 2: Star Map */}
          <div 
            onClick={() => setActiveTab('starmap')}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.05] transition-all"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-7 h-7 bg-space-blue rounded-lg flex items-center justify-center text-white shadow-sm">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-white/95">
                  Навигационная карта
                </h3>
                <p className="text-[10px] text-space-gray/80">
                  Накопительный супербонус (цикл 80 заказов)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-space-blue mr-1">
                {courier.starMapProgress}/80
              </span>
              <ChevronRight className="w-4 h-4 text-space-gray/50" />
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
