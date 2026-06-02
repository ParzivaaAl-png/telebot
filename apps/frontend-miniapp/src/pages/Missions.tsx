import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { CourierMissionsResponse } from '../shared-types';
import { Lock, Check, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Missions() {
  const { initData } = useTelegram();

  const { data, isLoading, error } = useQuery<CourierMissionsResponse>({
    queryKey: ['missions', initData],
    queryFn: () => apiRequest<CourierMissionsResponse>('/courier/me/missions', initData),
    refetchInterval: 5000,
    enabled: !!initData,
  });

  // Launch confetti if the driver has completed missions
  useEffect(() => {
    if (data?.missions) {
      const hasCompleted = data.missions.some(m => m.status === 'COMPLETED');
      if (hasCompleted) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.85 },
          colors: ['#00A3FF', '#7B61FF', '#00C48C', '#FFFFFF'],
        });
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-6 font-sans">
        <div className="text-center space-y-2">
          <div className="h-5 w-32 rounded skeleton-shimmer mx-auto" />
          <div className="h-3 w-56 rounded skeleton-shimmer mx-auto" />
        </div>

        <div className="relative flex flex-col items-center space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full max-w-sm glass-card p-5 flex items-start space-x-4">
              <div className="w-9 h-9 rounded-lg skeleton-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="h-2.5 w-12 rounded skeleton-shimmer" />
                  <div className="h-4.5 w-16 rounded-full skeleton-shimmer" />
                </div>
                <div className="h-3.5 w-36 rounded skeleton-shimmer" />
                <div className="flex space-x-2">
                  <div className="h-4 w-24 rounded-full skeleton-shimmer" />
                  <div className="h-4 w-16 rounded-full skeleton-shimmer" />
                </div>
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between">
                    <div className="h-2 w-20 rounded skeleton-shimmer" />
                    <div className="h-2 w-8 rounded skeleton-shimmer" />
                  </div>
                  <div className="h-1 w-full rounded-full skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-semibold text-sm tracking-wide">
          Ошибка загрузки
        </span>
        <span className="text-space-gray text-xs mt-1">
          Не удалось соединиться со спутником миссий.
        </span>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-space-green text-[#0A1628]">
            <span>Завершена</span>
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-space-blue text-[#0A1628] animate-pulse">
            <span>Активна</span>
          </span>
        );
      case 'LOCKED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-white/10 text-space-gray">
            <span>Заблокирована</span>
          </span>
        );
    }
  };

  const getMissionIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="p-2 bg-space-green/10 rounded-lg text-space-green">
            <Check className="w-4 h-4" />
          </div>
        );
      case 'ACTIVE':
        return (
          <div className="p-2 bg-space-blue/10 rounded-lg text-space-blue">
            <Zap className="w-4 h-4" />
          </div>
        );
      case 'LOCKED':
      default:
        return (
          <div className="p-2 bg-white/5 rounded-lg text-space-gray/50">
            <Lock className="w-4 h-4" />
          </div>
        );
    }
  };

  const getMissionTitle = (stage: number) => {
    switch (stage) {
      case 1: return 'Первый полет';
      case 2: return 'Звездный марш';
      case 3: return 'Космический Ас';
      default: return `Миссия Этап ${stage}`;
    }
  };

  return (
    <div className="px-4 py-3 space-y-6 font-sans">
      
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Дерево миссий
        </h1>
        <p className="text-xs text-space-gray/95 mt-1">
          Выполняйте задания и получайте дополнительные бонусы
        </p>
      </div>

      <div className="relative flex flex-col items-center space-y-5">
        
        {/* Simple elegant vertical line */}
        <div className="absolute top-10 bottom-10 w-[1px] bg-white/5 -z-10" />

        {data.missions.map((mission, index) => {
          const isLocked = mission.status === 'LOCKED';
          const pct = Math.min(100, (mission.progress / mission.target) * 100);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`w-full max-w-sm glass-card relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] ${isLocked ? 'opacity-55' : ''}`}
            >
              
              {/* WalletCard shine effect inside active items */}
              {!isLocked && <div className="wallet-card-overlay" />}

              <div className="p-5 flex items-start space-x-4 relative z-10">
                <div className="flex-shrink-0">{getMissionIcon(mission.status)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-space-gray uppercase tracking-wider">
                      Этап {mission.stage}
                    </span>
                    {getStatusBadge(mission.status)}
                  </div>
                  
                  <h3 className="font-bold text-sm text-white/95 leading-tight mt-1">
                    {getMissionTitle(mission.stage)}
                  </h3>
                  
                  {/* Rewards items styled as simple solid pills without borders */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[9px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
                      Награда: {mission.reward}
                    </span>
                    {mission.deadlineDays && (
                      <span className="text-[9px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
                        Срок: {mission.deadlineDays} дн.
                      </span>
                    )}
                    {mission.minRating && (
                      <span className="text-[9px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
                        Рейтинг &ge; {mission.minRating}
                      </span>
                    )}
                  </div>

                  {/* Clean progress bar */}
                  {!isLocked && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-space-gray mb-1.5 font-medium">
                        <span>Прогресс поездок</span>
                        <span>{mission.progress} / {mission.target}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            mission.status === 'COMPLETED' ? 'bg-space-green' : 'bg-space-blue'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="text-[10px] text-space-gray/50 italic mt-3 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Миссия заблокирована</span>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
