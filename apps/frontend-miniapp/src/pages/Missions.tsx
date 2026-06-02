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
  const [expandedStage, setExpandedStage] = React.useState<number | null>(1);
  const [shakingStage, setShakingStage] = React.useState<number | null>(null);

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

      // Auto-expand the active mission or the first uncompleted one
      const active = data.missions.find(m => m.status === 'ACTIVE');
      if (active) {
        setExpandedStage(active.stage);
      } else {
        const completedCount = data.missions.filter(m => m.status === 'COMPLETED').length;
        if (completedCount === 3) {
          setExpandedStage(3);
        } else {
          setExpandedStage(completedCount + 1);
        }
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
            <div key={i} className="w-full max-w-sm bg-white/[0.025] rounded-[20px] p-5 flex items-start space-x-4 relative overflow-hidden">
              <div className="w-9 h-9 rounded-lg skeleton-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="h-2.5 w-12 rounded skeleton-shimmer" />
                  <div className="h-4.5 w-16 rounded-full skeleton-shimmer animate-pulse" />
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-space-blue text-[#0A1628]">
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
          <div className="p-2 bg-space-blue/10 rounded-lg text-space-blue animate-pulse">
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
      case 1: return 'Запуск';
      case 2: return 'Орбита';
      case 3: return 'Гиперпрыжок';
      default: return `Миссия Этап ${stage}`;
    }
  };

  const getMissionCondition = (stage: number) => {
    switch (stage) {
      case 1: return 'пройти регистрацию и выполнить первые 20 заказов';
      case 2: return 'выполнить 40 поездок за 4 дня';
      case 3: return 'удерживать рейтинг 4.8+ и выполнить 60 заказов за неделю';
      default: return '';
    }
  };

  const completedCount = data.missions.filter(m => m.status === 'COMPLETED').length;

  return (
    <div className="px-4 py-3 space-y-6 font-sans">
      
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Миссии — First Flight
        </h1>
        <div className="inline-flex items-center px-3 py-1 bg-white/5 rounded-full text-[10px] font-semibold text-space-gray">
          Завершено {completedCount} из 3
        </div>
      </div>

      <div className="relative flex flex-col items-center space-y-5">
        
        {/* Simple elegant vertical line */}
        <div className="absolute top-10 bottom-10 w-[1px] bg-white/5 -z-10" />

        {data.missions.map((mission, index) => {
          const isLocked = mission.status === 'LOCKED';
          const isActive = mission.status === 'ACTIVE';
          const isCompleted = mission.status === 'COMPLETED';
          const isExpanded = expandedStage === mission.stage;
          const pct = Math.min(100, (mission.progress / mission.target) * 100);

          const handleNodeClick = () => {
            if (isLocked) {
              setShakingStage(mission.stage);
              setTimeout(() => setShakingStage(null), 400);
              return;
            }
            setExpandedStage(isExpanded ? null : mission.stage);
          };

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 10 }}
              animate={
                shakingStage === mission.stage 
                  ? { x: [-4, 4, -4, 4, -2, 2, 0], transition: { duration: 0.4 } } 
                  : { opacity: 1, y: 0 }
              }
              transition={{ delay: index * 0.1 }}
              onClick={handleNodeClick}
              className={`w-full max-w-sm glass-card relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01] cursor-pointer transition-shadow duration-300 ${
                isLocked ? 'opacity-50' : ''
              } ${
                isActive ? 'shadow-[0_0_20px_rgba(0,163,255,0.12)] border-space-blue/30' : ''
              } ${
                isCompleted ? 'border-space-green/20' : ''
              }`}
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

                  {/* Expandable Accordion content */}
                  <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden space-y-3"
                  >
                    <div className="pt-3">
                      <p className="text-[10px] text-space-gray/90 leading-relaxed">
                        <span className="font-semibold text-white/70">Условие:</span> {getMissionCondition(mission.stage)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
                        Награда: {mission.reward}
                      </span>
                      {mission.deadlineDays && (
                        <span className="text-[9px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-white/90">
                          Срок: {mission.deadlineDays} дн.
                        </span>
                      )}
                    </div>

                    {!isLocked && (
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-space-gray mb-1.5 font-medium">
                          <span>Прогресс миссии</span>
                          <span>{mission.progress} / {mission.target}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-space-green' : 'bg-space-blue'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <p className="text-[9px] text-space-green font-semibold mt-1">
                        Завершено: {new Date(mission.updatedAt).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </motion.div>

                  {isLocked && (
                    <div className="text-[10px] text-space-gray/50 italic mt-1.5 flex items-center space-x-1">
                      <Lock className="w-3 h-3" />
                      <span>Заверши предыдущую миссию</span>
                    </div>
                  )}

                  {!isExpanded && !isLocked && (
                    <p className="text-[9px] text-space-blue font-semibold mt-1.5">
                      Нажмите, чтобы открыть
                    </p>
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
