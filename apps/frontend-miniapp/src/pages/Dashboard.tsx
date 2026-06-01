import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierMeResponse } from '../shared-types';
import { Shield, Rocket, Compass, Award, Star, Bell, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { initData } = useTelegram();
  const { setActiveTab } = useAppStore();

  const { data, isLoading, error } = useQuery<CourierMeResponse>({
    queryKey: ['me'],
    queryFn: () => apiRequest<CourierMeResponse>('/courier/me', initData),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-12 h-12 text-space-blue animate-spin" />
        <span className="mt-4 text-space-gray text-sm">Связь с Центром Управления...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 text-lg font-bold">Ошибка стыковки</span>
        <span className="text-space-gray text-sm mt-2">Не удалось загрузить данные из Центра Управления.</span>
      </div>
    );
  }

  const { courier, nextRank, ordersToNextRank } = data;

  // Rank thresholds for visuals
  const getRankThreshold = (rank: string) => {
    if (rank === 'CADET') return 100;
    if (rank === 'NAVIGATOR') return 300;
    if (rank === 'PILOT') return 600;
    return 1000; // commander infinity
  };

  const currentThreshold = getRankThreshold(courier.rank);
  const prevThreshold = courier.rank === 'CADET' ? 0 : courier.rank === 'NAVIGATOR' ? 100 : courier.rank === 'PILOT' ? 300 : 600;
  
  // Progress calculations
  const rankProgressTotal = currentThreshold - prevThreshold;
  const rankProgressCurrent = Math.max(0, courier.ordersCount - prevThreshold);
  const rankPercent = Math.min(100, (rankProgressCurrent / rankProgressTotal) * 100);

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'CADET':
        return <Compass className="w-10 h-10 text-space-blue star-glow" />;
      case 'NAVIGATOR':
        return <Shield className="w-10 h-10 text-space-purple star-glow" />;
      case 'PILOT':
        return <Rocket className="w-10 h-10 text-space-green star-glow" />;
      case 'COMMANDER':
        return <Award className="w-10 h-10 text-yellow-400 star-glow" />;
      default:
        return <Compass className="w-10 h-10 text-space-blue" />;
    }
  };

  const getRankNameRu = (rank: string) => {
    switch (rank) {
      case 'CADET': return 'Кадет';
      case 'NAVIGATOR': return 'Навигатор';
      case 'PILOT': return 'Пилот';
      case 'COMMANDER': return 'Командор';
      default: return rank;
    }
  };

  return (
    <div className="space-y-6 px-4 py-3">
      {/* Driver Identity Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-space-blue/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-space-purple/5 rounded-full blur-2xl" />
        
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            {getRankIcon(courier.rank)}
          </div>
          <div>
            <div className="text-space-gray text-xs uppercase tracking-wider">Звание пилота</div>
            <h1 className="text-xl font-bold tracking-tight">{courier.name}</h1>
            <div className="text-xs text-space-blue font-semibold mt-0.5">
              Ранг: {getRankNameRu(courier.rank)} ({courier.rank})
            </div>
          </div>
        </div>

        {/* Stats segment */}
        <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-4 relative z-10">
          <div>
            <div className="text-space-gray text-[10px] uppercase tracking-wider">Полеты (заказы)</div>
            <div className="text-2xl font-black mt-0.5 glow-text-blue">{courier.ordersCount}</div>
          </div>
          <div>
            <div className="text-space-gray text-[10px] uppercase tracking-wider">Стабильность (рейтинг)</div>
            <div className="text-2xl font-black mt-0.5 flex items-center space-x-1">
              <span className="text-space-green glow-text-green">{courier.rating.toFixed(2)}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </div>

        {/* Progress meter */}
        <div className="mt-5 relative z-10">
          <div className="flex justify-between text-xs text-space-gray mb-1.5">
            <span>Прогресс звания</span>
            {nextRank ? (
              <span>{courier.ordersCount} / {currentThreshold}</span>
            ) : (
              <span>Максимальный ранг</span>
            )}
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${rankPercent}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-space-blue to-space-purple shadow-glow-blue"
            />
          </div>
          {nextRank && (
            <div className="text-[10px] text-space-gray/80 mt-1.5 text-right">
              Осталось заказов до звания <b>{getRankNameRu(nextRank)}</b>: <span className="text-space-blue">{ordersToNextRank}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* First Flight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setActiveTab('missions')}
          className="glass-card glass-card-hover rounded-xl p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-space-purple/10 rounded-lg border border-space-purple/20">
              <Rocket className="w-5 h-5 text-space-purple" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Первый Полет (Миссии)</h2>
              <p className="text-xs text-space-gray mt-0.5">RPG дерево стартовых заданий</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-space-gray" />
        </motion.div>

        {/* Star Map Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setActiveTab('starmap')}
          className="glass-card glass-card-hover rounded-xl p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-space-blue/10 rounded-lg border border-space-blue/20">
              <Star className="w-5 h-5 text-space-blue" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Звездная Карта</h2>
              <p className="text-xs text-space-gray mt-0.5">Накопительный бонус: 80 заказов</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-space-blue">{courier.starMapProgress}/80</span>
            <ArrowRight className="w-5 h-5 text-space-gray" />
          </div>
        </motion.div>

        {/* Notifications Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setActiveTab('notifications')}
          className="glass-card glass-card-hover rounded-xl p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-space-green/10 rounded-lg border border-space-green/20">
              <Bell className="w-5 h-5 text-space-green" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Бортовой журнал</h2>
              <p className="text-xs text-space-gray mt-0.5">Уведомления о миссиях и выплатах</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-space-gray" />
        </motion.div>
      </div>
    </div>
  );
}
