import type {
  ActiveTarget, Target, TargetType,
  DailyBreakdownEntry, WeeklyBreakdownEntry, TargetStats,
} from '@/types/target';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') ?? '';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? 'API error');
  }

  return res.json();
}

export const targetApi = {
  active: () =>
    request<{ data: ActiveTarget | null }>('GET', `/targets/active`),

  set: (type: TargetType, distance: number) =>
    request<{ message: string; data: Target }>('POST', '/targets', { type, distance }),

  history: () =>
    request<{ data: Target[] }>('GET', '/targets/history'),

  dailyBreakdown: (days = 7) =>
    request<{ data: DailyBreakdownEntry[] }>('GET', `/targets/daily-breakdown?days=${days}`),

  weeklyBreakdown: (weeks = 6) =>
    request<{ data: WeeklyBreakdownEntry[] }>('GET', `/targets/weekly-breakdown?weeks=${weeks}`),

  stats: (dailyTarget: number) =>
    request<{ data: TargetStats }>('GET', `/targets/stats?daily_target=${dailyTarget}`),

  currentWeekBreakdown: () =>
  request<{data: {day: string; date: string; distance: number;
    }[];}>('GET','/targets/current-week-breakdown'),

};