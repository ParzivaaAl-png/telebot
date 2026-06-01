const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiRequest<T>(endpoint: string, initData: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-telegram-init-data': initData,
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Network request failed');
  }

  return response.json();
}
