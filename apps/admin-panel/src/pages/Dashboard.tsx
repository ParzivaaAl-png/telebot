import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminRequest } from '../api';
import { AdminStatsResponse } from '../shared-types';
import { Users, Landmark, Star, Award, Compass, BarChart3, Activity } from 'lucide-react';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<AdminStatsResponse>({
    queryKey: ['stats'],
    queryFn: () => adminRequest<AdminStatsResponse>('/admin/stats'),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 text-space-blue animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500 font-bold">
        Не удалось загрузить статистику
      </div>
    );
  }

  const cards = [
    {
      title: 'Всего курьеров',
      value: data.totalCouriers,
      icon: <Users className="w-5 h-5 text-space-blue" />,
      desc: 'Зарегистрировано водителей',
    },
    {
      title: 'Всего заказов',
      value: data.totalOrders,
      icon: <Landmark className="w-5 h-5 text-space-purple" />,
      desc: 'Выполненных рейсов всего',
    },
    {
      title: 'Средний рейтинг',
      value: data.averageRating.toFixed(2),
      icon: <Star className="w-5 h-5 text-yellow-400" />,
      desc: 'Средний балл по таксопарку',
    },
    {
      title: 'Активные миссии',
      value: data.activeMissionsCount,
      icon: <Compass className="w-5 h-5 text-space-blue" />,
      desc: 'Текущие полеты в процессе',
    },
    {
      title: 'Завершенные миссии',
      value: data.completedMissionsCount,
      icon: <Award className="w-5 h-5 text-space-green" />,
      desc: 'Всего завершено миссий',
    },
    {
      title: 'Выданные бонусы',
      value: data.totalBonusesPaid,
      icon: <BarChart3 className="w-5 h-5 text-yellow-500" />,
      desc: 'Зафиксировано бонусов в системе',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Рабочий стол</h1>
        <p className="text-sm text-space-gray mt-1">Ключевая аналитика и статистика Atlas Fleet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card rounded-xl p-6 border border-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-space-gray uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-black mt-2 tracking-tight">{card.value}</h3>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/10">{card.icon}</div>
            </div>
            <p className="text-[11px] text-space-gray/80 mt-4">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
