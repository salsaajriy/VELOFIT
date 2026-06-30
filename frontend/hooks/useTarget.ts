'use client';
import { useCallback, useEffect, useState } from 'react';
import { targetApi } from '@/services/targetService';
import type {
ActiveTarget,
Target,
TargetType,
DailyBreakdownEntry,
WeeklyBreakdownEntry,
TargetStats,
} from '@/types/target';
export function useTarget(activeType: TargetType) {
const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);
const [history, setHistory] = useState<Target[]>([]);
const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdownEntry[]>([]);
const [weeklyBreakdown, setWeeklyBreakdown] = useState<WeeklyBreakdownEntry[]>([]);
const [stats, setStats] = useState<TargetStats | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const fetchAll = useCallback(async (fallbackType: TargetType) => {
setLoading(true);
setError('');
try {
  const activeRes = await targetApi.active();

  const currentType =
    activeRes.data?.type ??
    fallbackType;

  const [
    historyRes,
    dailyRes,
    weeklyRes,
  ] = await Promise.all([
    targetApi.history(),
    targetApi.dailyBreakdown(
      currentType === 'daily' ? 7 : 30
    ),
    targetApi.weeklyBreakdown(6),
  ]);

  setActiveTarget(activeRes.data);
  setHistory(historyRes.data);
  setDailyBreakdown(dailyRes.data);
  setWeeklyBreakdown(weeklyRes.data);

  const dailyTargetValue =
    currentType === 'daily'
      ? activeRes.data?.distance ?? 5
      : 5;

  const statsRes =
    await targetApi.stats(dailyTargetValue);

  setStats(statsRes.data);
} catch (err: unknown) {
  setError(
    err instanceof Error
      ? err.message
      : 'Failed to load target data.'
  );
} finally {
  setLoading(false);
}

}, []);

  useEffect(() => {
    void Promise.resolve().then(() => fetchAll(activeType));
  }, [activeType, fetchAll]);

  const setTarget = useCallback(

    async (type: TargetType, distance: number) => {
      await targetApi.set(type, distance);
      await fetchAll(type);
    },
    [fetchAll]
  );

  return {
    activeTarget,
    history,
    dailyBreakdown,
    weeklyBreakdown,
    stats,
    loading,
    error,
setTarget,

refetch: () => fetchAll(activeType),
};
}


