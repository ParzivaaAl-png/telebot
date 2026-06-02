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
          particleCount: 60,
          spread: 50,
          origin: { y: 0.85 },
          colors: ['#00A3FF', '#7B61FF', '#00C48C', '#FFFFFF'],
        });
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-10 h-10 text-space-purple animate-spin star-glow" />
        <span className="mt-4 text-space-purple font-orbitron text-xs tracking-wider animate-pulse">
          СКАНИРОВАНИЕ КОСМИЧЕСКИХ МИССИЙ...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-orbitron text-base font-bold tracking-wider uppercase glow-text-purple">
          [ Сбой Гиперсвязи ]
        </span>
        <span className="text-space-gray text-xs mt-2 font-exo">
          Не удалось загрузить карту миссий из центрального ядра.
        </span>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          wrapperClass: 'rgba(0, 196, 140, 0.4)',
          statusText: 'ЗАВЕРШЕНА',
          statusColor: 'text-space-green glow-text-green',
          borderGrad: 'from-space-green/45 to-space-green/10',
        };
      case 'ACTIVE':
        return {
          wrapperClass: 'rgba(0, 163, 255, 0.4)',
          statusText: 'АКТИВНА',
          statusColor: 'text-space-blue glow-text-blue animate-pulse',
          borderGrad: 'from-space-blue/45 via-space-purple/20 to-space-blue/15',
        };
      case 'LOCKED':
      default:
        return {
          wrapperClass: 'rgba(138, 155, 181, 0.1)',
          statusText: 'ЗАБЛОКИРОВАНА',
          statusColor: 'text-space-gray/50',
          borderGrad: 'from-white/10 to-white/5',
        };
    }
  };

  const getMissionIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="p-2 bg-space-green/20 rounded border border-space-green/35">
            <Check className="w-4 h-4 text-space-green star-glow" />
          </div>
        );
      case 'ACTIVE':
        return (
          <div className="p-2 bg-space-blue/20 rounded border border-space-blue/35">
            <Zap className="w-4 h-4 text-space-blue animate-bounce-slow star-glow" />
          </div>
        );
      case 'LOCKED':
      default:
        return (
          <div className="p-2 bg-white/5 rounded border border-white/15">
            <Lock className="w-4 h-4 text-space-gray/60" />
          </div>
        );
    }
  };

  const getMissionTitle = (stage: number) => {
    switch (stage) {
      case 1: return 'ПЕРВЫЙ ПОЛЕТ';
      case 2: return 'ЗВЕЗДНЫЙ МАРШ';
      case 3: return 'КОСМИЧЕСКИЙ АС';
      default: return `МИССИЯ ЭТАП ${stage}`;
    }
  };

  // Generate ASCII progress bar e.g. [██████░░░░] 60%
  const getAsciiProgressBar = (progress: number, target: number) => {
    const percentage = Math.min(100, Math.max(0, (progress / target) * 100));
    const filledCount = Math.round(percentage / 10);
    const emptyCount = 10 - filledCount;
    const bar = '█'.repeat(filledCount) + '░'.repeat(emptyCount);
    return `[${bar}] ${Math.round(percentage)}%`;
  };

  return (
    <div className="px-4 py-3 space-y-6 font-exo">
      
      <div className="text-center">
        <h1 className="text-xl font-orbitron font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple glow-text-blue">
          ДЕРЕВО МИССИЙ
        </h1>
        <p className="text-[10px] font-orbitron text-space-gray tracking-wider uppercase mt-1">
          // Навигационные задания и боевые награды флота
        </p>
      </div>

      {/* Vertical connection design inside grid */}
      <div className="relative flex flex-col items-center space-y-8">
        
        {/* Central HUD timeline dashed connector line */}
        <div className="absolute top-10 bottom-10 w-[1px] border-l border-dashed border-space-blue/30 -z-10" />

        {data.missions.map((mission, index) => {
          const isLocked = mission.status === 'LOCKED';
          const isActive = mission.status === 'ACTIVE';
          const isCompleted = mission.status === 'COMPLETED';
          const conf = getStatusConfig(mission.status);

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.12 }}
              className={`w-full max-w-sm relative ${isLocked ? 'opacity-55' : ''}`}
            >
              
              {/* Outer HUD Card wrapper with custom status borders */}
              <div 
                className="relative p-[1px] clip-path transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${conf.wrapperClass} 0%, rgba(13,27,49,0.3) 70%, rgba(255,255,255,0.03) 100%)`,
                  clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))'
                }}
              >
                <div 
                  className="bg-space-bg/90 backdrop-blur-md p-4 relative overflow-hidden"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))'
                  }}
                >
                  
                  {/* Decorative corner brackets */}
                  <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/10" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/10" />
                  
                  {/* Glowing core */}
                  {isActive && (
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-space-blue/5 rounded-full blur-2xl pointer-events-none" />
                  )}
                  {isCompleted && (
                    <div className="absolute -top-10 -right-10 w-28 h-28 bg-space-green/5 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="flex items-start space-x-3.5 relative z-10">
                    <div className="mt-0.5">{getMissionIcon(mission.status)}</div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-orbitron text-space-gray tracking-wider uppercase font-bold">
                          ЭТАП #0{mission.stage}
                        </span>
                        <span className={`text-[8px] font-orbitron tracking-wider font-bold ${conf.statusColor}`}>
                          // {conf.statusText}
                        </span>
                      </div>
                      
                      <h3 className="font-orbitron font-extrabold text-sm tracking-wide text-white leading-tight mt-0.5">
                        {getMissionTitle(mission.stage)}
                      </h3>
                      
                      {/* Reward specifications */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="text-[9px] font-orbitron bg-space-blue/10 border border-space-blue/30 px-2 py-0.5 rounded text-space-blue font-bold">
                          НАГРАДА: {mission.reward}
                        </span>
                        {mission.deadlineDays && (
                          <span className="text-[9px] font-orbitron bg-space-purple/10 border border-space-purple/35 px-2 py-0.5 rounded text-space-purple font-bold">
                            СРОК: {mission.deadlineDays} ДН.
                          </span>
                        )}
                        {mission.minRating && (
                          <span className="text-[9px] font-orbitron bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded text-yellow-400 font-bold">
                            РЕЙТИНГ &ge; {mission.minRating}
                          </span>
                        )}
                      </div>

                      {/* ASCII progress logs */}
                      {!isLocked && (
                        <div className="mt-4 font-mono text-[9px]">
                          <div className="flex justify-between text-space-gray mb-1">
                            <span>РЕЙСЫ</span>
                            <span>{mission.progress} / {mission.target}</span>
                          </div>
                          
                          {/* 6. ASCII progress bar */}
                          <div className="text-space-blue tracking-tighter glow-text-blue whitespace-pre font-bold">
                            {getAsciiProgressBar(mission.progress, mission.target)}
                          </div>
                        </div>
                      )}

                      {isLocked && (
                        <div className="text-[9px] font-orbitron text-space-gray/50 italic mt-3 flex items-center space-x-1">
                          <Lock className="w-3 h-3" />
                          <span>МОДУЛЬ ЗАБЛОКИРОВАН</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
