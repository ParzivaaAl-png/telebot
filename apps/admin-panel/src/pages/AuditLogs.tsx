import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminRequest } from '../api';
import { AuditLog } from '../shared-types';
import { Activity } from 'lucide-react';

export default function AuditLogs() {
  const { data, isLoading, error } = useQuery<AuditLog[]>({
    queryKey: ['logs'],
    queryFn: () => adminRequest<AuditLog[]>('/admin/logs'),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Журнал аудита</h1>
          <p className="text-sm text-space-gray mt-1">
            Хронология действий администраторов в системе Atlas Fleet
          </p>
        </div>

        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-space-gray text-xs uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Администратор</th>
                  <th className="py-4 px-6">Действие</th>
                  <th className="py-4 px-6">Подробности</th>
                  <th className="py-4 px-6">Дата и время</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-4 px-6"><div className="h-4 w-28 rounded skeleton-shimmer" /></td>
                    <td className="py-4 px-6"><div className="h-5 w-24 rounded-md skeleton-shimmer" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-64 rounded skeleton-shimmer" /></td>
                    <td className="py-4 px-6"><div className="h-4 w-32 rounded skeleton-shimmer font-mono" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500 font-bold">
        Не удалось загрузить логи аудита
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Журнал аудита</h1>
        <p className="text-sm text-space-gray mt-1">
          Хронология действий администраторов в системе Atlas Fleet
        </p>
      </div>

      <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-space-gray text-xs uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Администратор</th>
                <th className="py-4 px-6">Действие</th>
                <th className="py-4 px-6">Подробности</th>
                <th className="py-4 px-6">Дата и время</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/1 transition-colors">
                  <td className="py-4 px-6 font-bold text-white flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-space-purple" />
                    <span>{l.adminUsername}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md font-mono text-xs text-space-blue font-bold">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-space-gray text-xs">{l.details}</td>
                  <td className="py-4 px-6 text-space-gray/80 text-xs font-mono">
                    {new Date(l.createdAt).toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
