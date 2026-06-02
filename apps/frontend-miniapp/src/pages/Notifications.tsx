import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../api';
import { useTelegram } from '../hooks/useTelegram';
import { useAppStore } from '../store';
import { CourierNotificationsResponse } from '../shared-types';
import { Bell, Check, Award, AlertTriangle, Play, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Notifications({ active }: { active?: boolean }) {
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
    // When opened, mark all notifications as read (only if active)
    if (active && data?.notifications && data.notifications.some(n => !n.isRead)) {
      readMutation.mutate();
    }
  }, [data, active]);

  // Update unread count badge
  useEffect(() => {
    if (data?.notifications) {
      const unread = data.notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [data, setUnreadCount]);

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-6 font-sans text-white">
        <div className="text-center space-y-2">
          <div className="h-5 w-32 rounded skeleton-shimmer mx-auto" />
          <div className="h-3 w-56 rounded skeleton-shimmer mx-auto" />
        </div>

        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] rounded-[16px] flex items-start space-x-3.5 p-4 relative overflow-hidden">
              <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="h-3 w-28 rounded skeleton-shimmer" />
                  <div className="h-2 w-10 rounded skeleton-shimmer" />
                </div>
                <div className="h-2.5 w-full rounded skeleton-shimmer" />
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
          Ошибка соединения
        </span>
        <span className="text-space-gray text-xs mt-1">
          Не удалось считать новые записи бортового журнала.
        </span>
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MISSION_COMPLETE':
        return (
          <div className="w-8 h-8 rounded-full bg-space-green flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Check className="w-4 h-4" />
          </div>
        );
      case 'MISSION_UNLOCKED':
        return (
          <div className="w-8 h-8 rounded-full bg-space-blue flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Play className="w-4 h-4 text-white ml-0.5" />
          </div>
        );
      case 'BONUS_REWARD':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-[#0A1628] shadow-sm flex-shrink-0">
            <Award className="w-4 h-4" />
          </div>
        );
      case 'MISSION_EXPIRING':
      case 'ORDERS_LEFT':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="px-4 py-3 space-y-6 font-sans text-white">
      
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-white">
          Бортовой журнал
        </h1>
        <p className="text-xs text-space-gray/95 mt-1">
          Хронология ваших космических миссий и начислений
        </p>
      </div>

      {data.notifications.length === 0 ? (
        <div className="glass-card p-8 text-center text-xs text-space-gray italic">
          Лента уведомлений пуста.
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.notifications.map((n) => (
            <motion.div
              key={n.id}
              className={`ios-notification flex items-start space-x-3.5 p-4 relative overflow-hidden ${
                !n.isRead ? 'bg-white/[0.06]' : ''
              }`}
              whileTap={{ scale: 0.98 }}
            >
              
              {/* Subtle blue unread left line */}
              {!n.isRead && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-space-blue pointer-events-none" />
              )}

              <div className="flex-shrink-0">{getNotificationIcon(n.type)}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-white/95 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[9px] font-medium text-space-gray/80 ml-2">
                    {new Date(n.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-space-gray/90 mt-1 leading-normal">
                  {n.message}
                </p>
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
