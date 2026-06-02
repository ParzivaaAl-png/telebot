import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierMeResponse, CourierNotificationsResponse } from '../shared-types';
import { Shield, Rocket, Compass, Award, Star, Bell, ArrowRight, Activity, Terminal, Cpu } from 'lucide-react';
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
        <Activity className="w-10 h-10 text-space-blue animate-spin star-glow" />
        <span className="mt-4 text-space-blue font-orbitron text-xs tracking-wider animate-pulse">
          СВЯЗЬ С ЦЕНТРОМ УПРАВЛЕНИЯ...
        </span>
      </div>
    );
  }

  if (meError || !meData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-orbitron text-base font-bold tracking-wider uppercase glow-text-purple">
          [ Ошибка Стыковки ]
        </span>
        <span className="text-space-gray text-xs mt-2 font-exo">
          Не удалось загрузить данные из Главного Компьютера.
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

  // Chevron rendering helper
  const getRankBadgeInfo = (rank: string) => {
    switch (rank) {
      case 'CADET':
        return { symbol: '◈', name: 'КАДЕТ', level: 'LVL 1', sector: 'SECTOR A-01', colorClass: 'text-space-blue border-space-blue/30 bg-space-blue/10 shadow-[0_0_8px_rgba(0,163,255,0.15)]' };
      case 'NAVIGATOR':
        return { symbol: '▲', name: 'НАВИГАТОР', level: 'LVL 2', sector: 'SECTOR B-02', colorClass: 'text-space-purple border-space-purple/30 bg-space-purple/10 shadow-[0_0_8px_rgba(123,97,255,0.15)]' };
      case 'PILOT':
        return { symbol: '★', name: 'ПИЛОТ', level: 'LVL 3', sector: 'SECTOR C-03', colorClass: 'text-space-green border-space-green/30 bg-space-green/10 shadow-[0_0_8px_rgba(0,196,140,0.15)]' };
      case 'COMMANDER':
        return { symbol: '✦', name: 'КОМАНДОР', level: 'LVL 4', sector: 'SECTOR D-04', colorClass: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10 shadow-[0_0_8px_rgba(250,204,21,0.15)]' };
      default:
        return { symbol: '◈', name: rank, level: 'LVL 1', sector: 'SECTOR A-01', colorClass: 'text-space-blue border-space-blue/30 bg-space-blue/10' };
    }
  };

  const badge = getRankBadgeInfo(courier.rank);

  // Live telemetry mock generator (stable based on ordersCount)
  const getTelemetryStats = (ordersCount: number) => {
    const today = Math.min(ordersCount, Math.max(1, (ordersCount * 3) % 7 + 2));
    const week = Math.min(ordersCount, Math.max(today, Math.floor(ordersCount * 0.35) + 3));
    const lastFlightHrs = (ordersCount % 4) + 1;
    const lastFlightStr = `${lastFlightHrs} ч. назад`;
    return { today, week, lastFlightStr };
  };

  const telemetry = getTelemetryStats(courier.ordersCount);

  // Time format utility for logs
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

  const logs = notificationsData?.notifications.slice(0, 3) || [];

  return (
    <div className="space-y-5 px-4 py-3 font-exo">
      
      {/* 1. Asymmetric Cockpit Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="hud-pilot-card-wrapper"
      >
        <div className="hud-pilot-card-content relative overflow-hidden">
          
          {/* Decorative radar sweep / grids inside the card */}
          <div className="absolute top-0 right-0 w-28 h-28 border border-white/5 rounded-full -mr-10 -mt-10 pointer-events-none">
            <div className="absolute inset-2 border border-dashed border-space-blue/10 rounded-full" />
            <div className="absolute inset-6 border border-space-purple/5 rounded-full" />
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="text-[10px] font-orbitron text-space-gray tracking-widest uppercase">
                // БОРТОВОЙ ЖУРНАЛ ПИЛОТА
              </div>
              <h1 className="text-xl font-orbitron font-extrabold tracking-wide mt-1 text-space-white">
                {courier.name}
              </h1>
              
              {/* Emblem / Chevron Badge */}
              <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 mt-2 rounded border text-[9px] font-orbitron font-semibold tracking-wider ${badge.colorClass}`}>
                <span className="animate-pulse">{badge.symbol}</span>
                <span>{badge.name}</span>
                <span className="text-white/20">|</span>
                <span className="text-white/50">{badge.level}</span>
                <span className="text-white/20">|</span>
                <span className="text-white/50">{badge.sector}</span>
              </div>
            </div>
            
            {/* System Status Indicators */}
            <div className="flex flex-col items-end space-y-1">
              <div className="flex items-center space-x-1 text-[8px] font-orbitron text-space-green font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-space-green shadow-glow-green animate-ping" />
                <span>SYS: OK</span>
              </div>
              <div className="text-[7px] font-orbitron text-space-gray">
                SYS_VER: 2.4.0
              </div>
            </div>
          </div>

          {/* HUD Line separation */}
          <div className="hud-line-h my-4 opacity-50" />

          {/* 3. Live telemetry Stats Segment */}
          <div className="grid grid-cols-3 gap-2 mt-3 relative z-10">
            <div className="border-r border-white/5 pr-1">
              <div className="text-space-gray text-[8px] font-orbitron tracking-wider uppercase">
                ПОСЛЕДНИЙ ПОЛЕТ
              </div>
              <div className="text-sm font-rajdhani font-bold mt-1 text-white/95">
                {telemetry.lastFlightStr}
              </div>
            </div>
            
            <div className="border-r border-white/5 px-2">
              <div className="text-space-gray text-[8px] font-orbitron tracking-wider uppercase">
                СЕГОДНЯ
              </div>
              <div className="text-sm font-rajdhani font-bold mt-1 text-space-blue glow-text-blue">
                {telemetry.today} <span className="text-[9px] text-space-gray/70">рейсов</span>
              </div>
            </div>

            <div className="pl-2">
              <div className="text-space-gray text-[8px] font-orbitron tracking-wider uppercase">
                НЕДЕЛЯ
              </div>
              <div className="text-sm font-rajdhani font-bold mt-1 text-space-purple glow-text-purple">
                {telemetry.week} <span className="text-[9px] text-space-gray/70">рейсов</span>
              </div>
            </div>
          </div>

          {/* Standard stats display (Overall and stability) */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-white/5 relative z-10">
            <div>
              <div className="text-space-gray text-[9px] font-orbitron tracking-wider uppercase">
                ОБЩИЙ НАЛЕТ (ЗАКАЗЫ)
              </div>
              <div className="text-2xl font-orbitron font-black mt-0.5 text-space-blue glow-text-blue">
                {courier.ordersCount}
              </div>
            </div>
            <div>
              <div className="text-space-gray text-[9px] font-orbitron tracking-wider uppercase">
                КОЭФ. СТАБИЛЬНОСТИ
              </div>
              <div className="text-2xl font-orbitron font-black mt-0.5 flex items-center space-x-1">
                <span className="text-space-green glow-text-green">{courier.rating.toFixed(2)}</span>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 star-glow" />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-[10px] font-orbitron text-space-gray mb-1">
              <span>ПОСТРОЕНИЕ ТРАЕКТОРИИ</span>
              {nextRank ? (
                <span>{courier.ordersCount} / {currentThreshold}</span>
              ) : (
                <span>МАКС. РАНГ</span>
              )}
            </div>
            <div className="h-2 bg-white/5 border border-white/10 p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${rankPercent}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-space-blue via-space-purple to-space-green shadow-glow-blue"
              />
            </div>
            {nextRank && (
              <div className="text-[9px] font-orbitron text-space-gray/80 mt-1.5 text-right">
                ДО РАНГА <span className="text-space-blue font-bold">{nextRank}</span> ОСТАЛОСЬ: <span className="text-space-green font-bold">{ordersToNextRank} ЗАКАЗОВ</span>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* 2. Navigation Banners */}
      <div className="space-y-3">
        <div className="text-[10px] font-orbitron text-space-gray tracking-widest uppercase px-1">
          // НАВИГАЦИОННЫЕ МОДУЛИ
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          
          {/* Mission stage navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => setActiveTab('missions')}
            className="hud-card-wrapper cursor-pointer"
          >
            <div className="hud-card-content flex items-center justify-between py-3 px-4">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-space-purple/10 border border-space-purple/35 rounded text-space-purple">
                  <Rocket className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-orbitron font-bold text-xs tracking-wide text-white">
                    КОСМИЧЕСКИЕ МИССИИ
                  </h2>
                  <p className="text-[9px] text-space-gray/80 font-exo mt-0.5">
                    Интерактивное RPG дерево боевых задач
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 px-1.5 py-0.5 border border-space-purple/20 bg-space-purple/5 rounded text-[8px] font-orbitron text-space-purple">
                  <span className="w-1 h-1 rounded-full bg-space-purple animate-pulse" />
                  <span>ACTIVE</span>
                </div>
                <ArrowRight className="w-4 h-4 text-space-gray/60" />
              </div>
            </div>
          </motion.div>

          {/* Star Map navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setActiveTab('starmap')}
            className="hud-card-wrapper cursor-pointer"
          >
            <div className="hud-card-content flex items-center justify-between py-3 px-4">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-space-blue/10 border border-space-blue/35 rounded text-space-blue">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-orbitron font-bold text-xs tracking-wide text-white">
                    НАВИГАЦИОННАЯ КАРТА
                  </h2>
                  <p className="text-[9px] text-space-gray/80 font-exo mt-0.5">
                    Накопительный супербонус (цикл 80 заказов)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-orbitron font-bold text-space-blue mr-1">
                  {courier.starMapProgress}/80
                </span>
                <div className="flex items-center space-x-1 px-1.5 py-0.5 border border-space-blue/20 bg-space-blue/5 rounded text-[8px] font-orbitron text-space-blue">
                  <span className="w-1 h-1 rounded-full bg-space-blue animate-pulse" />
                  <span>ONLINE</span>
                </div>
                <ArrowRight className="w-4 h-4 text-space-gray/60" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* 9. Live System Logs Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-[10px] font-orbitron text-space-gray tracking-widest uppercase flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-space-green" />
            <span>// ТЕРМИНАЛ: ЛОГ БОРТКОМПЬЮТЕРА</span>
          </div>
          <button 
            onClick={() => setActiveTab('notifications')}
            className="text-[9px] font-orbitron text-space-green/80 hover:text-space-green transition-all"
          >
            ПОЛНЫЙ ЖУРНАЛ &rarr;
          </button>
        </div>

        <div className="hud-card-wrapper">
          <div className="hud-card-content bg-black/40 font-mono text-[10px] leading-relaxed p-4 space-y-2.5">
            {logs.length === 0 ? (
              <div className="text-space-gray italic">
                [SYSTEM LOG]: Система стабилизирована. Активных записей нет.
              </div>
            ) : (
              logs.map((log) => {
                let symbol = '⚡';
                let color = 'text-space-blue';
                if (log.type === 'MISSION_COMPLETE') {
                  symbol = '✓';
                  color = 'text-space-green';
                } else if (log.type === 'BONUS_REWARD') {
                  symbol = '★';
                  color = 'text-yellow-400';
                }

                return (
                  <div key={log.id} className="flex items-start space-x-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className={`font-bold ${color}`}>{symbol}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-white/90">
                        <span className="font-bold uppercase tracking-wide text-[9px]">{log.title}</span>
                        <span className="text-[8px] text-space-gray">{formatLogTime(log.createdAt)}</span>
                      </div>
                      <p className="text-[9px] text-space-gray/80 mt-0.5">{log.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Blinking CLI Cursor at the end */}
            <div className="flex items-center space-x-1 text-[8px] text-space-green/60 pt-1">
              <Cpu className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
              <span>AWAITING MISSION UPDATES</span>
              <span className="w-1.5 h-3 bg-space-green animate-pulse" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
