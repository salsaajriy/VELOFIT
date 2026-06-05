'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';

type TargetType = 'Daily' | 'Weekly';

interface Target {
  distance: number;
  startDate: string;
  endDate?: string;
}

interface TargetHistory {
  id: string;
  type: TargetType;
  distance: number;
  startDate: string;
  endDate?: string;
}

interface DailyProgress {
  date: string;
  distance: number;
}

interface WeeklyProgress {
  weekStart: string;
  totalDistance: number;
  days: {
    date: string;
    distance: number;
    achieved: boolean;
  }[];
}

// Dummy data for daily progress (30 days)
const generateDummyDailyProgress = (): DailyProgress[] => {
  const data: DailyProgress[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulate varying distances: 0-10 km, sometimes 0 for rest days
    const randomDistance = Math.random() * 10;
    data.push({
      date: dateStr,
      distance: Math.round(randomDistance * 10) / 10,
    });
  }
  
  return data;
};

const dummyDailyProgress: DailyProgress[] = generateDummyDailyProgress();

// Helper functions
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ── Statistics Card ─────────────────────────────────────────────────────────

interface StatisticsCardProps {
  activeType: TargetType;
  currentProgress: number;
  targetDistance: number;
  weeklyData?: WeeklyProgress;
  dailyData?: DailyProgress[];
  streakDays: number;
  bestDay: { date: string; distance: number } | null;
  totalThisPeriod: number;
  averagePerDay: number;
}

function StatisticsCard({ 
  activeType, 
  currentProgress, 
  targetDistance, 
  streakDays,
  bestDay,
  totalThisPeriod,
  averagePerDay
}: StatisticsCardProps) {
  const percent = Math.min(Math.round((currentProgress / targetDistance) * 100), 100);
  const remaining = Math.max(targetDistance - currentProgress, 0);
  
  return (
    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">
            {activeType === 'Daily' ? 'DAILY TARGET' : 'WEEKLY TARGET'}
          </p>
          <p className="text-3xl font-black mt-1">{targetDistance} km</p>
        </div>
        <div className="text-right">
          <p className="text-orange-100 text-xs">Progress</p>
          <p className="text-2xl font-black">{percent}%</p>
        </div>
      </div>
      
      <div className="relative h-3 bg-orange-400/30 rounded-full overflow-hidden mb-4">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-orange-400/30">
        <div>
          <p className="text-orange-100 text-xs">Current</p>
          <p className="text-xl font-bold">{currentProgress.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-orange-100 text-xs">Remaining</p>
          <p className="text-xl font-bold">{remaining.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-orange-100 text-xs">Daily Avg</p>
          <p className="text-xl font-bold">{averagePerDay.toFixed(1)} km</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-orange-400/30">
        <div>
          <p className="text-orange-100 text-xs">🔥 Streak</p>
          <p className="text-lg font-bold">{streakDays} days</p>
        </div>
        <div>
          <p className="text-orange-100 text-xs">🏆 Best Day</p>
          <p className="text-lg font-bold">
            {bestDay ? `${bestDay.distance.toFixed(1)} km` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Daily Breakdown Table ───────────────────────────────────────────────────

function DailyBreakdown({ 
  days, 
  targetDistance 
}: { 
  days: { date: string; distance: number; achieved: boolean }[];
  targetDistance: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-500">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" />
          </svg>
          Daily Breakdown
        </h3>
        <p className="text-xs text-gray-400 mt-1">Detailed daily achievements for this period</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {days.map((day, idx) => {
          const percent = Math.min(Math.round((day.distance / targetDistance) * 100), 100);
          
          return (
            <div key={idx} className="px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 w-20">
                    {formatDayName(day.date)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(day.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${day.achieved ? 'text-green-600' : 'text-orange-500'}`}>
                    {day.distance.toFixed(1)} km
                  </span>
                  {day.achieved ? (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                      ✓ Target Met
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {percent}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    day.achieved ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Add Target Modal (distance only) ───────────────────────────────────────

interface AddTargetModalProps {
  type: TargetType;
  currentDistance: number;
  onSave: (distance: number) => void;
  onClose: () => void;
}

function AddTargetModal({ type, currentDistance, onSave, onClose }: AddTargetModalProps) {
  const [distance, setDistance] = useState(String(currentDistance));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    onSave(Number(distance) || 0);
    setSaving(false);
    setSaved(true);
    await new Promise((r) => setTimeout(r, 600));
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900">Set {type} Target</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {type === 'Daily' 
                  ? 'Distance target you want to achieve each day' 
                  : 'Total distance target you want to achieve in a week'}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Distance Target
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5"
                  className="w-full px-4 py-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">km</span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {type === 'Daily' 
                  ? [3, 5, 8, 10].map((v) => (
                      <button
                        key={v}
                        onClick={() => setDistance(String(v))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          distance === String(v) ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        style={distance === String(v) ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' } : {}}
                      >
                        {v} km
                      </button>
                    ))
                  : [20, 30, 40, 50].map((v) => (
                      <button
                        key={v}
                        onClick={() => setDistance(String(v))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          distance === String(v) ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        style={distance === String(v) ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' } : {}}
                      >
                        {v} km/week
                      </button>
                    ))}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: saved ? '#22c55e' : 'linear-gradient(135deg, #e8571e, #f0a500)' }}
            >
              {saving ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : saved ? (
                'Saved!'
              ) : (
                'Save Target'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Confirmation Modal ─────────────────────────────────────────────────────

interface ConfirmSwitchModalProps {
  fromType: TargetType;
  toType: TargetType;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmSwitchModal({ fromType, toType, onConfirm, onCancel }: ConfirmSwitchModalProps) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#e8571e" strokeWidth="2" className="w-6 h-6">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Switch Target?</h3>
            <p className="text-sm text-gray-500 mb-6">
              You are about to switch from <span className="font-bold text-orange-600">{fromType}</span> target to{' '}
              <span className="font-bold text-orange-600">{toType}</span> target.<br />
              Your previous {fromType} target will end today.
            </p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200">
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#e8571e,#f0a500)' }}>
                Yes, Switch
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── History Timeline ──────────────────────────────────────────────────────

function HistoryTimeline({ history }: { history: TargetHistory[] }) {
  const sorted = [...history].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-500">
          <path d="M12 8v4l3 3M12 22a10 10 0 100-20 10 10 0 000 20z" strokeLinecap="round" />
        </svg>
        Target Change History
      </h3>
      
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No target history yet</p>
      ) : (
        <div className="relative pl-6 border-l-2 border-orange-200 space-y-5">
          {sorted.map((item) => (
            <div key={item.id} className="relative">
              <div className="absolute -left-[26px] w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white shadow-sm" />
              <div className="mb-1 flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.type === 'Daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {item.type}
                </span>
                <span className="text-xs text-gray-400">{formatFullDate(item.startDate)}</span>
                {item.endDate && (
                  <>
                    <span className="text-xs text-gray-300">→</span>
                    <span className="text-xs text-gray-400">{formatFullDate(item.endDate)}</span>
                  </>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800">
                Target {item.distance} km {item.type === 'Daily' ? 'per day' : 'per week'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Weekly Comparison Chart ───────────────────────────────────────────────

function WeeklyComparisonChart({ 
  weeklyProgress, 
  weeklyTargets 
}: { 
  weeklyProgress: WeeklyProgress[];
  weeklyTargets: Map<string, number>;
}) {
  const weeks = weeklyProgress.slice(-8);
  const maxValue = Math.max(...weeks.map(w => w.totalDistance), ...Array.from(weeklyTargets.values()), 1);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-500">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" />
        </svg>
        Weekly Comparison (Actual vs Target)
      </h3>
      
      <div className="flex items-end gap-3 h-64 overflow-x-auto pb-4">
        {weeks.map((week) => {
          const target = weeklyTargets.get(week.weekStart) || 35;
          const actual = week.totalDistance;
          
          return (
            <div key={week.weekStart} className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="relative flex items-end gap-1 h-48">
                <div
                  className="w-8 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(target / maxValue) * 100}%`, minHeight: '4px' }}
                />
                <div
                  className="w-8 bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(actual / maxValue) * 100}%`, minHeight: '4px' }}
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-gray-600">{formatDate(week.weekStart)}</div>
                <div className="text-xs text-gray-500 mt-1">{actual.toFixed(1)}/{target} km</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-center gap-6 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-gray-300 to-gray-400" />
          <span className="text-xs text-gray-500">Weekly Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-t from-orange-500 to-orange-600" />
          <span className="text-xs text-gray-500">Actual</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function TargetPage() {
  const [activeTargetType, setActiveTargetType] = useState<TargetType>('Daily');
  const [dailyTarget, setDailyTarget] = useState<number>(5);
  const [weeklyTarget, setWeeklyTarget] = useState<number>(35);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTargetType, setPendingTargetType] = useState<TargetType | null>(null);
  
  const [targetHistory, setTargetHistory] = useState<TargetHistory[]>([
    { id: '1', type: 'Daily', distance: 5, startDate: '2026-04-01' },
    { id: '2', type: 'Weekly', distance: 40, startDate: '2026-05-01', endDate: '2026-05-07' },
    { id: '3', type: 'Daily', distance: 5, startDate: '2026-05-08' },
  ]);

  // Get current date info
  const today = new Date().toISOString().split('T')[0];
  const currentWeekStart = getWeekStart(new Date());
  
  // Get today's progress
  const todayProgress = dummyDailyProgress.find(p => p.date === today)?.distance || 0;
  
  // Get current week progress with daily breakdown
  const currentWeekDays = dummyDailyProgress.filter(p => getWeekStart(new Date(p.date)) === currentWeekStart);
  const currentWeekProgress = currentWeekDays.reduce((sum, p) => sum + p.distance, 0);
  
  // Prepare weekly progress with daily breakdown
  const weeklyProgressMap = new Map<string, { totalDistance: number; days: { date: string; distance: number; achieved: boolean }[] }>();
  
  dummyDailyProgress.forEach(p => {
    const weekStart = getWeekStart(new Date(p.date));
    const targetDist = activeTargetType === 'Daily' ? dailyTarget : weeklyTarget;
    const achieved = activeTargetType === 'Daily' 
      ? p.distance >= dailyTarget 
      : false;
    
    if (!weeklyProgressMap.has(weekStart)) {
      weeklyProgressMap.set(weekStart, { totalDistance: 0, days: [] });
    }
    const week = weeklyProgressMap.get(weekStart)!;
    week.totalDistance += p.distance;
    week.days.push({
      date: p.date,
      distance: p.distance,
      achieved: achieved
    });
  });
  
  const weeklyProgress: WeeklyProgress[] = Array.from(weeklyProgressMap.entries()).map(([weekStart, data]) => ({
    weekStart,
    totalDistance: data.totalDistance,
    days: data.days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }));
  
  // Map weekly targets from history
  const weeklyTargetsMap = new Map<string, number>();
  targetHistory.forEach(history => {
    if (history.type === 'Weekly' && history.startDate) {
      const weekStart = getWeekStart(new Date(history.startDate));
      weeklyTargetsMap.set(weekStart, history.distance);
    }
  });
  
  // Get current active target
  const getCurrentActiveTarget = () => {
    const activeHistory = targetHistory
      .filter(h => h.type === activeTargetType && !h.endDate)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
    return activeHistory?.distance || (activeTargetType === 'Daily' ? dailyTarget : weeklyTarget);
  };
  
  const targetDistance = getCurrentActiveTarget();
  const currentProgress = activeTargetType === 'Daily' ? todayProgress : currentWeekProgress;
  
  // Calculate statistics
  const calculateStreakDays = (): number => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const progress = dummyDailyProgress.find(p => p.date === dateStr);
      
      if (progress && progress.distance >= dailyTarget) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };
  
  const getBestDay = () => {
    let best = { date: '', distance: 0 };
    dummyDailyProgress.forEach(p => {
      if (p.distance > best.distance) {
        best = { date: p.date, distance: p.distance };
      }
    });
    return best.distance > 0 ? best : null;
  };
  
  const getTotalThisPeriod = (): number => {
    if (activeTargetType === 'Daily') {
      // Last 7 days
      const last7Days = dummyDailyProgress.slice(-7);
      return last7Days.reduce((sum, p) => sum + p.distance, 0);
    } else {
      return currentWeekProgress;
    }
  };
  
  const getAveragePerDay = (): number => {
    if (activeTargetType === 'Daily') {
      const last7Days = dummyDailyProgress.slice(-7);
      const avg = last7Days.reduce((sum, p) => sum + p.distance, 0) / 7;
      return avg;
    } else {
      return currentWeekProgress / 7;
    }
  };
  
  // Get current period days for breakdown
  const getCurrentPeriodDays = () => {
    if (activeTargetType === 'Daily') {
      // Last 7 days
      const last7Days = dummyDailyProgress.slice(-7);
      return last7Days.map(day => ({
        date: day.date,
        distance: day.distance,
        achieved: day.distance >= dailyTarget
      }));
    } else {
      const currentWeek = weeklyProgress.find(w => w.weekStart === currentWeekStart);
      return currentWeek?.days || [];
    }
  };
  
  const handleSwitchTarget = (newType: TargetType) => {
    if (newType === activeTargetType) return;
    setPendingTargetType(newType);
    setShowConfirmModal(true);
  };
  
  const confirmSwitchTarget = () => {
    if (pendingTargetType) {
      const todayStr = new Date().toISOString().split('T')[0];
      setTargetHistory(prev => 
        prev.map(h => 
          h.type === activeTargetType && !h.endDate 
            ? { ...h, endDate: todayStr }
            : h
        )
      );
      
      const newTarget: TargetHistory = {
        id: Date.now().toString(),
        type: pendingTargetType,
        distance: pendingTargetType === 'Daily' ? dailyTarget : weeklyTarget,
        startDate: todayStr,
      };
      setTargetHistory(prev => [...prev, newTarget]);
      setActiveTargetType(pendingTargetType);
    }
    setShowConfirmModal(false);
    setPendingTargetType(null);
  };
  
  const handleSaveTarget = (distance: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setTargetHistory(prev => 
      prev.map(h => 
        h.type === activeTargetType && !h.endDate 
          ? { ...h, endDate: todayStr }
          : h
      )
    );
    
    const newTarget: TargetHistory = {
      id: Date.now().toString(),
      type: activeTargetType,
      distance: distance,
      startDate: todayStr,
    };
    setTargetHistory(prev => [...prev, newTarget]);
    
    if (activeTargetType === 'Daily') {
      setDailyTarget(distance);
    } else {
      setWeeklyTarget(distance);
    }
  };
  
  const getPeriodLabel = () => {
    if (activeTargetType === 'Daily') {
      return `Today (${formatDate(today)})`;
    } else {
      return `This week (${formatDate(currentWeekStart)})`;
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-7 pt-6">
          <h1 className="text-2xl font-black text-gray-900">Fitness Target</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your daily or weekly fitness goals</p>
        </div>
        
        {/* Target Type Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Target Type</p>
              <p className="text-sm text-gray-500 mt-0.5">Choose between daily consistency or weekly flexibility</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleSwitchTarget('Daily')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTargetType === 'Daily'
                    ? 'text-white shadow-md'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                style={activeTargetType === 'Daily' ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' } : {}}
              >
                📅 Daily
              </button>
              <button
                onClick={() => handleSwitchTarget('Weekly')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  activeTargetType === 'Weekly'
                    ? 'text-white shadow-md'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                style={activeTargetType === 'Weekly' ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' } : {}}
              >
                📊 Weekly
              </button>
            </div>
          </div>
        </div>
        
        {/* Statistics Card - Dynamic based on mode */}
        <div className="mb-6">
          <StatisticsCard
            activeType={activeTargetType}
            currentProgress={currentProgress}
            targetDistance={targetDistance}
            streakDays={calculateStreakDays()}
            bestDay={getBestDay()}
            totalThisPeriod={getTotalThisPeriod()}
            averagePerDay={getAveragePerDay()}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#e8571e,#f0a500)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Update {activeTargetType === 'Daily' ? 'Daily' : 'Weekly'} Target
          </button>
        </div>
        
        {/* Daily Breakdown - Complete daily details */}
        <div className="mb-6">
          <DailyBreakdown 
            days={getCurrentPeriodDays()} 
            targetDistance={activeTargetType === 'Daily' ? dailyTarget : weeklyTarget / 7}
          />
        </div>
        
        {/* Weekly Comparison Chart */}
        <div className="mb-6">
          <WeeklyComparisonChart 
            weeklyProgress={weeklyProgress} 
            weeklyTargets={weeklyTargetsMap}
          />
        </div>
        
        {/* History Timeline */}
        <HistoryTimeline history={targetHistory} />
        
        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex gap-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="w-5 h-5 flex-shrink-0 mt-0.5">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How do targets work?</p>
              <p className="text-blue-700">
                • <strong>Daily Mode</strong>: Statistics show the last 7 days, each day has its own target.<br />
                • <strong>Weekly Mode</strong>: Statistics focus on weekly target, daily breakdown is still shown.<br />
                • Every time you switch target types, the history is recorded for performance evaluation.
              </p>
            </div>
          </div>
        </div>
        
      </main>
      
      {showAddModal && (
        <AddTargetModal
          type={activeTargetType}
          currentDistance={targetDistance}
          onSave={handleSaveTarget}
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {showConfirmModal && pendingTargetType && (
        <ConfirmSwitchModal
          fromType={activeTargetType}
          toType={pendingTargetType}
          onConfirm={confirmSwitchTarget}
          onCancel={() => {
            setShowConfirmModal(false);
            setPendingTargetType(null);
          }}
        />
      )}
    </div>
  );
}