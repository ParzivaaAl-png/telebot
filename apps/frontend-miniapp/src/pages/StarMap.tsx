import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { CourierStarMapResponse } from '../shared-types';
import { Compass, Calendar, Activity, Map, Navigation, ArrowRight } from 'lucide-react';
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
        <Activity className="w-10 h-10 text-space-blue animate-spin star-glow" />
        <span className="mt-4 text-space-blue font-orbitron text-xs tracking-wider animate-pulse">
          ЗАГРУЗКА ЗВЕЗДНЫХ КООРДИНАТ...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-orbitron text-base font-bold tracking-wider uppercase glow-text-purple">
          [ Сбой Системы Навигации ]
        </span>
        <span className="text-space-gray text-xs mt-2 font-exo">
          Не удалось считать данные звездной траектории.
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
    <div className="px-4 py-3 space-y-6 font-exo">
      
      <div className="text-center">
        <h1 className="text-xl font-orbitron font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple glow-text-blue">
          НАВИГАЦИОННАЯ КАРТА
        </h1>
        <p className="text-[10px] font-orbitron text-space-gray tracking-wider uppercase mt-1">
          // Накопительная программа полетов флота
        </p>
      </div>

      {/* Main progress dial */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="hud-card-wrapper"
      >
        <div className="hud-card-content flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-white/10" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b border-r border-white/10" />
          
          {/* Background scan glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-space-blue/5 to-transparent pointer-events-none" />

          {/* 1. Radar Navigation HUD Dial */}
          <div className="relative w-56 h-56 flex items-center justify-center mt-3">
            
            {/* HUD Reticle Crosshairs */}
            <div className="absolute w-[80%] h-[1px] border-t border-dashed border-space-blue/20 pointer-events-none" />
            <div className="absolute h-[80%] w-[1px] border-l border-dashed border-space-blue/20 pointer-events-none" />
            
            {/* Concentric radar rings */}
            <div className="absolute w-[60%] h-[60%] rounded-full border border-dotted border-space-blue/15 pointer-events-none" />
            <div className="absolute w-[35%] h-[35%] rounded-full border border-space-blue/10 pointer-events-none" />
            
            {/* Radar Angle Labels / Compass Points */}
            <span className="absolute top-1 text-[8px] font-orbitron font-bold text-space-blue/60 tracking-wider">000°</span>
            <span className="absolute right-1 text-[8px] font-orbitron font-bold text-space-blue/60 tracking-wider">090°</span>
            <span className="absolute bottom-1 text-[8px] font-orbitron font-bold text-space-blue/60 tracking-wider">180°</span>
            <span className="absolute left-1 text-[8px] font-orbitron font-bold text-space-blue/60 tracking-wider">270°</span>

            {/* Glowing sweep overlay */}
            <div className="absolute inset-0 rounded-full border border-dashed border-space-blue/5 animate-spin pointer-events-none" style={{ animationDuration: '10s' }} />

            <svg className="absolute w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="hudRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00A3FF" />
                  <stop offset="50%" stopColor="#7B61FF" />
                  <stop offset="100%" stopColor="#00C48C" />
                </linearGradient>
                <filter id="hud-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Outer compass ring */}
              <circle
                cx="112"
                cy="112"
                r={radius + 8}
                stroke="rgba(0, 163, 255, 0.15)"
                strokeWidth="1"
                fill="transparent"
                strokeDasharray="4, 6"
              />
              
              {/* Background Track */}
              <circle
                cx="112"
                cy="112"
                r={radius}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Active Circle with glow */}
              <motion.circle
                cx="112"
                cy="112"
                r={radius}
                stroke="url(#hudRingGrad)"
                strokeWidth="7"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                fill="transparent"
                strokeLinecap="round"
                filter="url(#hud-glow-filter)"
              />
            </svg>
            
            {/* Center target indicator */}
            <div className="absolute flex flex-col items-center text-center z-10">
              <Compass className="w-7 h-7 text-space-blue animate-pulse star-glow mb-1" />
              <span className="text-2xl font-orbitron font-black tracking-tight text-white glow-text-blue">
                {progress} / {target}
              </span>
              <span className="text-[8px] font-orbitron text-space-gray uppercase tracking-widest font-bold">
                ЦЕЛЬ: {target} REQ
              </span>
            </div>

          </div>

          {/* Target telemetry specification */}
          <div className="w-full text-center mt-5 border-t border-white/5 pt-4 space-y-2 relative z-10">
            <div className="text-xs font-orbitron font-bold tracking-wide">
              КУРС: {target} РЕЙСОВ • НАГРАДА: <span className="text-space-green font-extrabold glow-text-green">{reward}</span>
            </div>
            {remaining > 0 ? (
              <p className="text-[10px] text-space-gray/90 tracking-wide">
                НЕОБХОДИМО ВЫПОЛНИТЬ ЕЩЕ <span className="text-space-blue font-bold glow-text-blue">{remaining}</span> РЕЙСОВ ДО СТЫКОВКИ
              </p>
            ) : (
              <p className="text-[10px] text-space-green font-extrabold tracking-widest animate-pulse glow-text-green">
                // ТРАЕКТОРИЯ ВЫПОЛНЕНА • НАГРАДА СФОРМИРОВАНА
              </p>
            )}
          </div>

        </div>
      </motion.div>

      {/* Bonus Payout History */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-orbitron text-space-gray tracking-widest uppercase flex items-center space-x-2 px-1">
          <Map className="w-3.5 h-3.5 text-space-purple" />
          <span>// ЖУРНАЛ КВИТАНЦИЙ (ВЫПЛАТЫ)</span>
        </h2>
        
        {history.length === 0 ? (
          <div className="hud-card-wrapper">
            <div className="hud-card-content text-center text-[10px] text-space-gray italic">
              Навигационный архив пуст. Начните движение по курсу.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="hud-card-wrapper"
              >
                <div className="hud-card-content flex justify-between items-center py-3.5 px-4 bg-black/25">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-space-green/10 border border-space-green/35 rounded text-space-green">
                      <Navigation className="w-4 h-4 star-glow" />
                    </div>
                    <div>
                      <h4 className="font-orbitron font-bold text-xs text-white">
                        НАЧИСЛЕНИЕ СУПЕРБОНУСА
                      </h4>
                      <p className="text-[9px] text-space-gray flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(b.grantedAt).toLocaleDateString('ru-RU')}
                        <span className="mx-1.5 text-white/20">|</span>
                        <span>TX: SUCCESS</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-orbitron font-black text-space-green glow-text-green">
                      +{b.amount}
                    </span>
                    <ArrowRight className="w-3 h-3 text-space-gray/50" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
