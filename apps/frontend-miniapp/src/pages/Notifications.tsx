import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierNotificationsResponse } from '../shared-types';
import { Bell, Check, Award, AlertTriangle, Play, Activity } from 'lucide-react';
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

  // Update unread count badge in Zustand store
  useEffect(() => {
    if (data?.notifications) {
      const unread = data.notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [data, setUnreadCount]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Activity className="w-12 h-12 text-space-green animate-spin" />
        <span className="mt-4 text-space-gray text-sm">Чтение бортового журнала...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <span className="text-red-500 text-lg font-bold">Сбой борткомпьютера</span>
        <span className="text-space-gray text-sm mt-2">Не удалось загрузить лог уведомлений.</span>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MISSION_COMPLETE':
        return (
          <div className="p-2 bg-space-green/10 rounded-lg border border-space-green/20">
            <Check className="w-4 h-4 text-space-green" />
          </div>
        );
      case 'MISSION_UNLOCKED':
        return (
          <div className="p-2 bg-space-blue/10 rounded-lg border border-space-blue/20">
            <Play className="w-4 h-4 text-space-blue" />
          </div>
        );
      case 'BONUS_REWARD':
        return (
          <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <Award className="w-4 h-4 text-yellow-400" />
          </div>
        );
      case 'MISSION_EXPIRING':
      case 'ORDERS_LEFT':
      default:
        return (
          <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
        );
    }
  };

  return (
    <div className="px-4 py-3 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple glow-text-blue">
          БОРТОВОЙ ЖУРНАЛ
        </h1>
        <p className="text-xs text-space-gray mt-1">Хронология ваших космических миссий</p>
      </div>

      {data.notifications.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center text-space-gray text-xs">
          Сообщений нет. Летите к звездам!
        </div>
      ) : (
        <div className="space-y-3">
          {data.notifications.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-card rounded-xl p-4 flex items-start space-x-3 relative overflow-hidden transition-all ${!n.isRead ? 'border-space-blue/30 bg-space-blue/5' : ''}`}
            >
              {/* Blue indicator stripe for unread */}
              {!n.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-space-blue shadow-glow-blue" />
              )}

              <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs truncate leading-snug">{n.title}</h4>
                  <span className="text-[9px] text-space-gray flex-shrink-0 ml-2">
                    {new Date(n.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-space-gray/90 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
