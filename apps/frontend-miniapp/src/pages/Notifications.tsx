import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierNotificationsResponse } from '../shared-types';
import { Bell, Check, Award, AlertTriangle, Play, Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications() {
  const { initData } = useTelegram();
  const { setUnreadCount } = useAppStore();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<CourierNotificationsResponse>({
    queryKey: ['notifications', initData],
    queryFn: () => apiRequest<CourierNotificationsResponse>('/courier/me/notifications', initData),
    refetchInterval: 5000,
    enabled: !!initData,
  });

  const readMutation = useMutation({
    mutationFn: () => apiRequest<any>('/courier/me/notifications/read', initData, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      setUnreadCount(0);
    },
  });

  useEffect(() => {
    // When opened, mark all notifications as read
    if (data?.notifications && data.notifications.some(n => !n.isRead)) {
      readMutation.mutate();
    }
  }, [data]);

  // Update unread count badge
  useEffect(() => {
    if (data?.notifications) {
      const unread = data.notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [data, setUnreadCount]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-10 h-10 text-space-green animate-spin star-glow" />
        <span className="mt-4 text-space-green font-orbitron text-xs tracking-wider animate-pulse">
          ЧТЕНИЕ БОРТОВОГО ЖУРНАЛА...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 font-orbitron text-base font-bold tracking-wider uppercase glow-text-purple">
          [ Сбой Борткомпьютера ]
        </span>
        <span className="text-space-gray text-xs mt-2 font-exo">
          Не удалось прочесть логи уведомлений.
        </span>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MISSION_COMPLETE':
        return (
          <div className="p-1.5 bg-space-green/10 rounded border border-space-green/35">
            <Check className="w-3.5 h-3.5 text-space-green star-glow" />
          </div>
        );
      case 'MISSION_UNLOCKED':
        return (
          <div className="p-1.5 bg-space-blue/10 rounded border border-space-blue/35">
            <Play className="w-3.5 h-3.5 text-space-blue star-glow" />
          </div>
        );
      case 'BONUS_REWARD':
        return (
          <div className="p-1.5 bg-yellow-500/10 rounded border border-yellow-500/30">
            <Award className="w-3.5 h-3.5 text-yellow-400 star-glow" />
          </div>
        );
      case 'MISSION_EXPIRING':
      case 'ORDERS_LEFT':
      default:
        return (
          <div className="p-1.5 bg-red-500/10 rounded border border-red-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 star-glow" />
          </div>
        );
    }
  };

  return (
    <div className="px-4 py-3 space-y-6 font-exo">
      
      <div className="text-center">
        <h1 className="text-xl font-orbitron font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple glow-text-blue">
          БОРТОВОЙ ЖУРНАЛ
        </h1>
        <p className="text-[10px] font-orbitron text-space-gray tracking-wider uppercase mt-1">
          // Хронологический протокол летных операций
        </p>
      </div>

      {data.notifications.length === 0 ? (
        <div className="hud-card-wrapper">
          <div className="hud-card-content text-center text-[10px] text-space-gray italic">
            Сообщений нет. Летите к звездам!
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          <div className="text-[9px] font-orbitron text-space-gray tracking-widest uppercase flex items-center space-x-1.5 px-1">
            <Terminal className="w-3 h-3 text-space-blue" />
            <span>// АКТИВНЫЕ ЛОГИ: СЕКТОР ПОЛЕТОВ</span>
          </div>

          <div className="space-y-3">
            {data.notifications.map((n, idx) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hud-card-wrapper"
              >
                {/* Glowing border indication for unread items */}
                <div 
                  className={`hud-card-content flex items-start space-x-3.5 relative overflow-hidden py-3 px-4 ${
                    !n.isRead ? 'bg-space-blue/5 border border-space-blue/30 shadow-[inset_0_0_8px_rgba(0,163,255,0.15)]' : 'bg-black/25'
                  }`}
                >
                  
                  {/* Left indicator stripe for unread */}
                  {!n.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-space-blue shadow-glow-blue pointer-events-none" />
                  )}

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/5" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/5" />

                  <div className="mt-0.5 z-10">{getNotificationIcon(n.type)}</div>
                  
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex justify-between items-start">
                      <h4 className="font-orbitron font-extrabold text-xs text-white truncate leading-snug">
                        {n.title}
                      </h4>
                      <span className="text-[8px] font-mono text-space-gray flex-shrink-0 ml-2">
                        [{new Date(n.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-space-gray/95 mt-1.5 leading-relaxed font-mono">
                      &gt; {n.message}
                    </p>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
