import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { CourierStarMapResponse } from '../shared-types';
import { Navigation, Compass, Calendar, Activity, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarMap() {
  const { initData } = useTelegram();

  const { data, isLoading, error } = useQuery<CourierStarMapResponse>({
    queryKey: ['starmap'],
    queryFn: () => apiRequest<CourierStarMapResponse>('/courier/me/starmap', initData),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-12 h-12 text-space-blue animate-spin" />
        <span className="mt-4 text-space-gray text-sm">Инициализация навигатора...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 text-lg font-bold">Сбой звездной карты</span>
        <span className="text-space-gray text-sm mt-2">Не удалось загрузить координаты.</span>
      </div>
    );
  }

  const { progress, target, reward, remaining, history } = data;

  // SVG Circumference details
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const fillPercentage = Math.min(100, (progress / target) * 100);
  const strokeDashoffset = circumference - (fillPercentage / 100) * circumference;

  return (
    <div className="px-4 py-3 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple glow-text-blue">
          ЗВЕЗДНАЯ КАРТА
        </h1>
        <p className="text-xs text-space-gray mt-1">Делайте заказы и приближайтесь к супербонусу</p>
      </div>

      {/* Main progress dial */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 flex flex-col items-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-space-blue/5 rounded-full blur-3xl -z-10" />
        
        {/* Ring widget */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A3FF" />
                <stop offset="100%" stopColor="#7B61FF" />
              </linearGradient>
              <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Background Track */}
            <circle
              cx="104"
              cy="104"
              r={radius}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active Circle with glow */}
            <motion.circle
              cx="104"
              cy="104"
              r={radius}
              stroke="url(#ringGrad)"
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              fill="transparent"
              strokeLinecap="round"
              filter="url(#glow-filter)"
            />
          </svg>
          
          {/* Inner stats text */}
          <div className="absolute flex flex-col items-center text-center">
            <Compass className="w-8 h-8 text-space-blue animate-pulse star-glow mb-1" />
            <span className="text-3xl font-black tracking-tight glow-text-blue">{progress} / {target}</span>
            <span className="text-[10px] text-space-gray uppercase tracking-wider font-semibold">заказов</span>
          </div>
        </div>

        {/* Milestone Description */}
        <div className="w-full text-center mt-4 border-t border-white/5 pt-4 space-y-2">
          <div className="text-sm font-semibold">
            Цель: {target} заказов • Бонус: <span className="text-space-green font-bold glow-text-green">{reward}</span>
          </div>
          {remaining > 0 ? (
            <p className="text-xs text-space-gray">
              Осталось сделать <span className="text-space-blue font-bold">{remaining}</span> заказов до завершения цикла
            </p>
          ) : (
            <p className="text-xs text-space-green font-bold animate-pulse">
              Цель достигнута! Ожидайте подтверждения выплаты.
            </p>
          )}
        </div>
      </motion.div>

      {/* Bonus Payout History */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-space-gray uppercase tracking-wider flex items-center space-x-2">
          <Map className="w-4 h-4 text-space-purple" />
          <span>Журнал выплат</span>
        </h2>
        
        {history.length === 0 ? (
          <div className="glass-card rounded-xl p-5 text-center text-xs text-space-gray">
            История выплат пуста. Сделайте первый шаг по карте!
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-xl p-4 flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-space-green/10 rounded-lg border border-space-green/20">
                    <Navigation className="w-4 h-4 text-space-green" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">Выплата по Звездной карте</h4>
                    <p className="text-[10px] text-space-gray flex items-center mt-0.5">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(b.grantedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-space-green glow-text-green">+{b.amount}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
