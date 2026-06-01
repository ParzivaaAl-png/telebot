import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { CourierMissionsResponse } from '../shared-types';
import { Lock, Check, Zap, HelpCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Missions() {
  const { initData } = useTelegram();

  const { data, isLoading, error } = useQuery<CourierMissionsResponse>({
    queryKey: ['missions'],
    queryFn: () => apiRequest<CourierMissionsResponse>('/courier/me/missions', initData),
    refetchInterval: 5000,
  });

  // Launch confetti if the driver has completed missions
  useEffect(() => {
    if (data?.missions) {
      const hasCompleted = data.missions.some(m => m.status === 'COMPLETED');
      if (hasCompleted) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00A3FF', '#7B61FF', '#00C48C', '#FFFFFF'],
        });
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-12 h-12 text-space-purple animate-spin" />
        <span className="mt-4 text-space-gray text-sm">Построение карты миссий...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 text-lg font-bold">Сбой гиперсвязи</span>
        <span className="text-space-gray text-sm mt-2">Не удалось загрузить карту миссий.</span>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-space-green shadow-glow-green bg-space-green/5';
      case 'ACTIVE':
        return 'border-space-blue shadow-glow-blue bg-space-blue/5 animate-pulse-slow';
      case 'LOCKED':
      default:
        return 'border-white/10 opacity-60 bg-white/2';
    }
  };

  const getMissionIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="p-2.5 bg-space-green/20 rounded-full border border-space-green/30">
            <Check className="w-5 h-5 text-space-green" />
          </div>
        );
      case 'ACTIVE':
        return (
          <div className="p-2.5 bg-space-blue/20 rounded-full border border-space-blue/30">
            <Zap className="w-5 h-5 text-space-blue animate-bounce-slow" />
          </div>
        );
      case 'LOCKED':
      default:
        return (
          <div className="p-2.5 bg-white/5 rounded-full border border-white/10">
            <Lock className="w-5 h-5 text-space-gray" />
          </div>
        );
    }
  };

  const getMissionTitle = (stage: number) => {
    switch (stage) {
      case 1: return 'Миссия 1: Первый полет';
      case 2: return 'Миссия 2: Звездный марш';
      case 3: return 'Миссия 3: Космический Ас';
      default: return `Миссия Stage ${stage}`;
    }
  };

  return (
    <div className="px-4 py-3 relative min-h-[80vh]">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple glow-text-blue">
          ДЕРЕВО МИССИЙ
        </h1>
        <p className="text-xs text-space-gray mt-1">Прокладывайте свой путь во вселенной мотивации</p>
      </div>

      {/* Connection Backbone Layout */}
      <div className="relative flex flex-col items-center space-y-12">
        {/* Central Vertical Connector Line */}
        <div className="absolute top-10 bottom-10 w-0.5 bg-gradient-to-b from-space-blue/40 via-space-purple/30 to-white/5 -z-10" />

        {data.missions.map((mission, index) => {
          const isLocked = mission.status === 'LOCKED';
          const isActive = mission.status === 'ACTIVE';
          const isCompleted = mission.status === 'COMPLETED';

          const pct = Math.min(100, (mission.progress / mission.target) * 100);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 }}
              className={`glass-card rounded-2xl p-5 w-full max-w-sm border relative overflow-hidden transition-all duration-300 ${getStatusStyle(mission.status)}`}
            >
              {/* Background gradient flares */}
              {isActive && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-space-blue/5 rounded-full blur-xl" />
              )}
              {isCompleted && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-space-green/5 rounded-full blur-xl" />
              )}

              <div className="flex items-start space-x-4 relative z-10">
                <div className="mt-1">{getMissionIcon(mission.status)}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-space-gray uppercase font-semibold tracking-wider">Этап {mission.stage}</span>
                  <h3 className="font-bold text-base leading-tight mt-0.5">{getMissionTitle(mission.stage)}</h3>
                  
                  {/* Rewards and Rules */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-space-blue font-semibold">
                      Награда: {mission.reward}
                    </span>
                    {mission.deadlineDays && (
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-space-purple">
                        Срок: {mission.deadlineDays} дн.
                      </span>
                    )}
                    {mission.minRating && (
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-yellow-400">
                        Рейтинг ≥ {mission.minRating}
                      </span>
                    )}
                  </div>

                  {/* Progress panel */}
                  {!isLocked && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-space-gray mb-1">
                        <span>Выполнено заказов</span>
                        <span>{mission.progress} / {mission.target}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-space-green shadow-glow-green' : 'bg-space-blue shadow-glow-blue'}`}
                        />
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="text-xs text-space-gray/60 italic mt-3 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5" />
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
