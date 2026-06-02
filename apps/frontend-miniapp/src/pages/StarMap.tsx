import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { CourierStarMapResponse } from '../shared-types';
import { Compass, Calendar, Activity, Map, Navigation, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarMap() {
  const { initData } = useTelegram();

  const { data, isLoading, error } = useQuery<CourierStarMapResponse>({
    queryKey: ['starmap', initData],
    queryFn: () => apiRequest<CourierStarMapResponse>('/courier/me/starmap', initData),
    refetchInterval: 5000,
    enabled: !!initData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-8 h-8 text-space-blue animate-spin" />
        <span className="mt-4 text-space-gray text-xs tracking-wide animate-pulse">
          Загрузка звездной карты...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-semibold text-sm tracking-wide">
          Ошибка загрузки карты
        </span>
        <span className="text-space-gray text-xs mt-1">
          Не удалось считать координаты программы накопления.
        </span>
      </div>
    );
  }

  const { progress, target, reward, remaining, history } = data;

  // SVG Circumference details
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min(100, (progress / target) * 100);
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  return (
    <div className="px-4 py-3 space-y-6 font-sans text-white">
      
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Навигационная карта
        </h1>
        <p className="text-xs text-space-gray/95 mt-1">
          Выполняйте рейсы и приближайтесь к супербонусу
        </p>
      </div>

      {/* Main progress dial (Apple Fitness activity ring style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01]"
      >
        <div className="wallet-card-overlay" />
        
        {/* Ring widget */}
        <div className="relative w-52 h-52 flex items-center justify-center mt-2">
          <svg className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id="appleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A3FF" />
                <stop offset="100%" stopColor="#7B61FF" />
              </linearGradient>
            </defs>
            
            {/* Background Track */}
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active Circle with rounded endcaps */}
            <motion.circle
              cx="104"
              cy="104"
              r={radius}
              stroke="url(#appleRingGrad)"
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              fill="transparent"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Inner stats text */}
          <div className="absolute flex flex-col items-center text-center">
            <Compass className="w-8 h-8 text-space-blue mb-1" />
            <span className="text-3xl font-black tracking-tight text-white">{progress} / {target}</span>
            <span className="text-[10px] text-space-gray/80 font-bold uppercase tracking-wider">рейсов</span>
          </div>
        </div>

        {/* Milestone Description */}
        <div className="w-full text-center mt-5 border-t border-white/5 pt-4 space-y-1 relative z-10">
          <div className="text-xs font-semibold text-white/95">
            Цель: {target} заказов • Бонус: <span className="text-space-green font-bold">{reward}</span>
          </div>
          {remaining > 0 ? (
            <p className="text-[10px] text-space-gray">
              Осталось сделать <span className="text-space-blue font-bold">{remaining}</span> заказов до завершения цикла
            </p>
          ) : (
            <p className="text-[10px] text-space-green font-semibold animate-pulse">
              Цель достигнута! Ожидайте начисления выплаты.
            </p>
          )}
        </div>
      </motion.div>

      {/* Bonus Payout History */}
      <div className="space-y-2.5">
        <h2 className="text-[11px] font-bold text-space-gray uppercase tracking-wider flex items-center space-x-2 px-1">
          <Map className="w-3.5 h-3.5 text-space-purple" />
          <span>История выплат</span>
        </h2>
        
        {history.length === 0 ? (
          <div className="glass-card p-5 text-center text-xs text-space-gray italic">
            История выплат пока пуста.
          </div>
        ) : (
          <div className="glass-card overflow-hidden border border-white/5 divide-y divide-white/5 shadow-sm">
            {history.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center p-4 hover:bg-white/[0.01] transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  {/* Clean icon container with no border */}
                  <div className="w-8 h-8 rounded-lg bg-space-green/10 flex items-center justify-center text-space-green">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white/95">Выплата бонуса</h4>
                    <p className="text-[10px] text-space-gray/80 flex items-center mt-0.5">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(b.grantedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-space-green">+{b.amount}</span>
                  <ChevronRight className="w-4 h-4 text-space-gray/30" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
