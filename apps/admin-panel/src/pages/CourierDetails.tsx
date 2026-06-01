import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminRequest } from '../api';
import { useAdminStore } from '../store';
import { ArrowLeft, Landmark, Award, ShieldAlert, Check, Milestone, RefreshCw, Star, Coins } from 'lucide-react';

export default function CourierDetails() {
  const { selectedCourierId, setSelectedCourierId } = useAdminStore();
  const queryClient = useQueryClient();

  const [ordersInput, setOrdersInput] = useState('');
  const [ratingInput, setRatingInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Override states
  const [overrideStage, setOverrideStage] = useState('1');
  const [overrideStatus, setOverrideStatus] = useState('ACTIVE');
  const [overrideProgress, setOverrideProgress] = useState('0');

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ['courier', selectedCourierId],
    queryFn: () => adminRequest<any>(`/admin/couriers/${selectedCourierId}`),
    enabled: !!selectedCourierId,
    onSuccess: (data) => {
      setOrdersInput(data.ordersCount.toString());
      setRatingInput(data.rating.toString());
      setNameInput(data.name);
    },
  });

  const updateOrdersMutation = useMutation({
    mutationFn: (body: any) => adminRequest<any>(`/admin/couriers/${selectedCourierId}/orders`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['courier', selectedCourierId]);
      queryClient.invalidateQueries(['couriers']);
      alert('Данные курьера успешно обновлены');
    },
  });

  const overrideStageMutation = useMutation({
    mutationFn: (body: any) => adminRequest<any>(`/admin/couriers/${selectedCourierId}/missions/stage`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['courier', selectedCourierId]);
      queryClient.invalidateQueries(['couriers']);
      alert('Миссия успешно изменена');
    },
  });

  const resetStageMutation = useMutation({
    mutationFn: (stageNum: number) => adminRequest<any>(`/admin/couriers/${selectedCourierId}/missions/stage`, {
      method: 'DELETE',
      body: JSON.stringify({ stage: stageNum }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['courier', selectedCourierId]);
      queryClient.invalidateQueries(['couriers']);
      alert('Миссия успешно сброшена');
    },
  });

  const grantStarMapMutation = useMutation({
    mutationFn: () => adminRequest<any>(`/admin/couriers/${selectedCourierId}/starmap/bonus`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['courier', selectedCourierId]);
      queryClient.invalidateQueries(['couriers']);
      alert('Бонус по Звездной карте выдан, счетчик сброшен');
    },
    onError: (err: any) => {
      alert(`Ошибка: ${err.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-space-blue animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500 font-bold">
        Не удалось загрузить карточку курьера
      </div>
    );
  }

  const handleUpdateOrders = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrdersMutation.mutate({
      ordersCount: Number(ordersInput),
      rating: Number(ratingInput),
      name: nameInput,
    });
  };

  const handleOverrideStage = (e: React.FormEvent) => {
    e.preventDefault();
    overrideStageMutation.mutate({
      stage: Number(overrideStage),
      status: overrideStatus,
      progress: Number(overrideProgress),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header back button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setSelectedCourierId(null)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-space-gray hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Карточка курьера</h1>
          <p className="text-sm text-space-gray mt-0.5">{data.name} • ID: {data.telegramId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics and Quick Form Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Stats Panel */}
          <div className="glass-card rounded-xl p-6 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-space-gray uppercase tracking-wider">Основная информация</h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Имя:</span>
                <span className="text-white text-xs font-bold">{data.name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Username:</span>
                <span className="text-white text-xs font-mono">@{data.username || 'нет'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Telegram ID:</span>
                <span className="text-white text-xs font-mono">{data.telegramId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Ранг:</span>
                <span className="text-space-blue text-xs font-bold">{data.rank}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Заказы:</span>
                <span className="text-white text-xs font-bold">{data.ordersCount}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Рейтинг:</span>
                <span className="text-yellow-400 text-xs font-bold">★ {data.rating.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-space-gray text-xs">Звездная карта:</span>
                <span className="text-space-blue text-xs font-bold">{data.starMapProgress} / 80</span>
              </div>
            </div>

            {/* Quick Star Map Bonus Trigger */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (confirm('Подтвердить выплату 2000 ₽ по Звездной карте?')) {
                    grantStarMapMutation.mutate();
                  }
                }}
                disabled={data.starMapProgress < 80}
                className="w-full bg-space-green hover:bg-space-green/90 disabled:bg-white/5 disabled:text-white/30 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Выдать бонус Star Map (2000 ₽)</span>
              </button>
              {data.starMapProgress < 80 && (
                <p className="text-[10px] text-space-gray mt-1 text-center">Необходимо накопить 80 заказов</p>
              )}
            </div>
          </div>

          {/* Quick Edit Form */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-space-gray uppercase tracking-wider mb-4">Изменить показатели</h3>
            <form onSubmit={handleUpdateOrders} className="space-y-4">
              <div>
                <label className="block text-xs text-space-gray mb-1">Имя</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-space-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-space-gray mb-1">Всего заказов</label>
                <input
                  type="number"
                  value={ordersInput}
                  onChange={(e) => setOrdersInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-space-blue"
                />
              </div>
              <div>
                <label className="block text-xs text-space-gray mb-1">Рейтинг</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="5"
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-space-blue"
                />
              </div>
              <button
                type="submit"
                disabled={updateOrdersMutation.isLoading}
                className="w-full bg-space-blue hover:bg-space-blue/90 disabled:bg-space-blue/50 text-white font-bold text-xs py-2 rounded-lg transition-colors"
              >
                Сохранить данные
              </button>
            </form>
          </div>
        </div>

        {/* Missions override and Bonus History */}
        <div className="lg:col-span-2 space-y-6">
          {/* RPG Mission Tree Stage table */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-space-gray uppercase tracking-wider mb-4">Этапы миссий First Flight</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-space-gray">
                    <th className="py-3 px-4">Миссия (Этап)</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4">Прогресс</th>
                    <th className="py-3 px-4">Цель</th>
                    <th className="py-3 px-4">Награда</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {data.missions.map((m: any) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/1">
                      <td className="py-3 px-4 font-bold">Этап {m.stage}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'COMPLETED' ? 'bg-space-green/10 text-space-green border border-space-green/20' :
                          m.status === 'ACTIVE' ? 'bg-space-blue/10 text-space-blue border border-space-blue/20' :
                          'bg-white/5 text-space-gray border border-white/10'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">{m.progress}</td>
                      <td className="py-3 px-4 text-space-gray">{m.target}</td>
                      <td className="py-3 px-4 text-space-blue font-semibold">{m.reward}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Сбросить прогресс по Миссии ${m.stage}?`)) {
                              resetStageMutation.mutate(m.stage);
                            }
                          }}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white border border-red-500/20 rounded-md transition-all text-[10px]"
                        >
                          Сбросить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Manual Override Form */}
            <div className="mt-6 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-space-gray uppercase tracking-wider mb-3">Ручное изменение этапа</h4>
              <form onSubmit={handleOverrideStage} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-[10px] text-space-gray mb-1">Этап</label>
                  <select
                    value={overrideStage}
                    onChange={(e) => setOverrideStage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-space-blue"
                  >
                    <option value="1" className="bg-space-bg">1 (20 заказов)</option>
                    <option value="2" className="bg-space-bg">2 (40 заказов)</option>
                    <option value="3" className="bg-space-bg">3 (60 заказов)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-space-gray mb-1">Статус</label>
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-space-blue"
                  >
                    <option value="LOCKED" className="bg-space-bg">LOCKED (Закрыт)</option>
                    <option value="ACTIVE" className="bg-space-bg">ACTIVE (Активен)</option>
                    <option value="COMPLETED" className="bg-space-bg">COMPLETED (Выполнен)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-space-gray mb-1">Прогресс</label>
                  <input
                    type="number"
                    value={overrideProgress}
                    onChange={(e) => setOverrideProgress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-space-blue"
                  />
                </div>
                <button
                  type="submit"
                  disabled={overrideStageMutation.isLoading}
                  className="w-full bg-space-purple hover:bg-space-purple/90 disabled:bg-space-purple/50 text-white font-bold text-xs py-2 rounded-lg transition-colors"
                >
                  Изменить
                </button>
              </form>
            </div>
          </div>

          {/* Bonus Ledger */}
          <div className="glass-card rounded-xl p-6 border border-white/5">
            <h3 className="text-sm font-bold text-space-gray uppercase tracking-wider mb-4">История бонусов и наград</h3>
            {data.bonusHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-space-gray">
                Наградные бонусы еще не выдавались.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-space-gray">
                      <th className="py-2.5 px-4">Тип</th>
                      <th className="py-2.5 px-4">Сумма / Приз</th>
                      <th className="py-2.5 px-4">Дата выдачи</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bonusHistory.map((b: any) => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/1">
                        <td className="py-2.5 px-4 font-semibold text-white">
                          {b.type === 'STAR_MAP' ? 'Звездная карта' : `Миссия этапа ${b.type.split('_')[1]}`}
                        </td>
                        <td className="py-2.5 px-4 text-space-green font-bold">{b.amount}</td>
                        <td className="py-2.5 px-4 text-space-gray">
                          {new Date(b.grantedAt).toLocaleString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
