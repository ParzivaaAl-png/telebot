import React, { useState } from 'react';
import { adminRequest } from '../api';
import { useAdminStore } from '../store';
import { KeyRound, ShieldAlert } from 'lucide-react';
import { AdminLoginResponse } from '@atlas-fleet/shared-types';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAdminStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminRequest<AdminLoginResponse>('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, passwordHash: password }),
      });
      setAuth(data.token, data.admin.username);
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-bg px-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 space-y-6 border border-white/10 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-space-blue/10 rounded-xl border border-space-blue/20">
            <KeyRound className="w-6 h-6 text-space-blue" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-space-blue to-space-purple">Atlas Fleet Panel</h2>
          <p className="text-sm text-space-gray">Панель управления • Авторизация</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs px-4 py-3 rounded-lg flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-space-gray uppercase mb-1">Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-space-blue transition-colors"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-space-gray uppercase mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-space-blue transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-space-blue hover:bg-space-blue/90 disabled:bg-space-blue/50 text-white font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? 'Вход в систему...' : 'Подключиться к терминалу'}
          </button>
        </form>
      </div>
    </div>
  );
}
