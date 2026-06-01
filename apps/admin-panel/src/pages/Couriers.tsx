import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminRequest } from '../api';
import { useAdminStore } from '../store';
import { AdminCouriersResponse, Rank } from '@atlas-fleet/shared-types';
import { Search, ChevronLeft, ChevronRight, Eye, ArrowUpDown, ShieldCheck, Activity } from 'lucide-react';

export default function Couriers() {
  const { setSelectedCourierId } = useAdminStore();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rank, setRank] = useState<string>('');
  const [sortBy, setSortBy] = useState('ordersCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useQuery<AdminCouriersResponse>({
    queryKey: ['couriers', page, search, rank, sortBy, sortOrder],
    queryFn: () => {
      const q = new URLSearchParams();
      q.set('page', page.toString());
      q.set('limit', '10');
      if (search) q.set('search', search);
      if (rank) q.set('rank', rank);
      if (sortBy) q.set('sortBy', sortBy);
      if (sortOrder) q.set('sortOrder', sortOrder);
      
      return adminRequest<AdminCouriersResponse>(`/admin/couriers?${q.toString()}`);
    },
    keepPreviousData: true,
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRankBadgeClass = (rk: string) => {
    switch (rk) {
      case 'CADET': return 'bg-space-blue/10 text-space-blue border-space-blue/20';
      case 'NAVIGATOR': return 'bg-space-purple/10 text-space-purple border-space-purple/20';
      case 'PILOT': return 'bg-space-green/10 text-space-green border-space-green/20';
      case 'COMMANDER': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const totalPages = data ? Math.ceil(data.total / 10) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">База курьеров</h1>
          <p className="text-sm text-space-gray mt-1">Управление водителями, миссиями и Звездными картами</p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по имени, Telegram ID..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-space-blue transition-colors"
          />
          <Search className="w-4 h-4 text-space-gray absolute left-3.5 top-3.5" />
        </div>
        <div>
          <select
            value={rank}
            onChange={(e) => { setRank(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-space-blue transition-colors"
          >
            <option value="" className="bg-space-bg">Все ранги</option>
            <option value="CADET" className="bg-space-bg">Cadet (Кадет)</option>
            <option value="NAVIGATOR" className="bg-space-bg">Navigator (Навигатор)</option>
            <option value="PILOT" className="bg-space-bg">Pilot (Пилот)</option>
            <option value="COMMANDER" className="bg-space-bg">Commander (Командор)</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Activity className="w-8 h-8 text-space-blue animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 font-bold">
            Ошибка при загрузке курьеров
          </div>
        ) : data?.couriers.length === 0 ? (
          <div className="text-center py-16 text-space-gray text-sm">
            Курьеры не найдены.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-space-gray text-xs uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Имя</th>
                  <th className="py-4 px-6">Telegram ID</th>
                  <th className="py-4 px-6 cursor-pointer" onClick={() => handleSort('rank')}>
                    <div className="flex items-center space-x-1">
                      <span>Ранг</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer" onClick={() => handleSort('ordersCount')}>
                    <div className="flex items-center space-x-1">
                      <span>Заказы</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer" onClick={() => handleSort('rating')}>
                    <div className="flex items-center space-x-1">
                      <span>Рейтинг</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer" onClick={() => handleSort('starMapProgress')}>
                    <div className="flex items-center space-x-1">
                      <span>Звездная карта</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6">Регистрация</th>
                  <th className="py-4 px-6 text-right">Действия</th>
                </tr>
              </thead>
              <tbody>
                {data?.couriers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">{c.name}</td>
                    <td className="py-4 px-6 text-space-gray font-mono">{c.telegramId}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 border rounded-full text-xs font-semibold ${getRankBadgeClass(c.rank)}`}>
                        {c.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-space-blue">{c.ordersCount}</td>
                    <td className="py-4 px-6 text-yellow-400 font-bold">★ {c.rating.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
                          <div 
                            style={{ width: `${(c.starMapProgress / 80) * 100}%` }}
                            className="bg-space-blue h-full rounded-full"
                          />
                        </div>
                        <span className="text-xs font-bold text-space-gray">{c.starMapProgress}/80</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-space-gray text-xs">
                      {new Date(c.registeredAt).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedCourierId(c.id)}
                        className="p-2 bg-white/5 hover:bg-space-blue/20 hover:text-white rounded-lg border border-white/10 text-space-gray transition-all inline-flex items-center space-x-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Детали</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white/1 px-6 py-4 rounded-xl border border-white/5">
          <span className="text-xs text-space-gray">
            Показано {(page - 1) * 10 + 1} - {Math.min(page * 10, data?.total || 0)} из {data?.total}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-space-gray hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs text-white font-bold">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-space-gray hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
