'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

type TargetType = 'Daily' | 'Weekly';

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

// Dummy data for daily progress (30 days)
const generateDummyDailyProgress = (): DailyProgress[] => {
  const data: DailyProgress[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const randomDistance = Math.random() * 10;
    data.push({
      date: dateStr,
      distance: Math.round(randomDistance * 10) / 10,
    });
  }
  return data;
};

const dummyDailyProgress: DailyProgress[] = generateDummyDailyProgress();

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

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

// ── Add Target Modal ───────────────────────────────────────────────────────
function AddTargetModal({ type, currentDistance, onSave, onClose }: { 
  type: TargetType; 
  currentDistance: number; 
  onSave: (distance: number) => void; 
  onClose: () => void;
}) {
  const [distance, setDistance] = useState(String(currentDistance));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onSave(Number(distance) || 0);
    setSaving(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
            <h2 className="font-semibold text-gray-900">Set {type} Target</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="p-5">
            <label className="text-xs font-medium text-gray-500 uppercase">Distance (km)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <div className="flex gap-2 mt-3">
              {(type === 'Daily' ? [3,5,8,10] : [20,30,40,50]).map((v) => (
                <button key={v} onClick={() => setDistance(String(v))} className="px-3 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200">
                  {v} km{type === 'Weekly' && '/wk'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 p-5 pt-0">
            <button onClick={onClose} className="flex-1 py-2 text-sm border rounded-lg">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Confirmation Modal ─────────────────────────────────────────────────────
function ConfirmSwitchModal({ fromType, toType, onConfirm, onCancel }: {
  fromType: TargetType; toType: TargetType; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-72 bg-white rounded-xl p-5 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg">⟳</div>
          <h3 className="font-semibold mb-1">Switch Target?</h3>
          <p className="text-xs text-gray-500 mb-4">Switch from {fromType} to {toType}? Previous target will end today.</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2 text-sm border rounded-lg">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2 text-sm text-white bg-orange-500 rounded-lg">Switch</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TargetPage() {
  const [activeType, setActiveType] = useState<TargetType>('Daily');
  const [dailyTarget, setDailyTarget] = useState(5);
  const [weeklyTarget, setWeeklyTarget] = useState(35);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<TargetType | null>(null);
  
  const [targetHistory] = useState<TargetHistory[]>([
    { id: '1', type: 'Daily', distance: 5, startDate: '2026-04-01' },
    { id: '2', type: 'Weekly', distance: 40, startDate: '2026-05-01', endDate: '2026-05-07' },
    { id: '3', type: 'Daily', distance: 5, startDate: '2026-05-08' },
  ]);

  const today = new Date().toISOString().split('T')[0];
  const currentWeekStart = getWeekStart(new Date());
  
  const todayProgress = dummyDailyProgress.find(p => p.date === today)?.distance || 0;
  const currentWeekProgress = dummyDailyProgress
    .filter(p => getWeekStart(new Date(p.date)) === currentWeekStart)
    .reduce((sum, p) => sum + p.distance, 0);
  
  const targetDistance = activeType === 'Daily' ? dailyTarget : weeklyTarget;
  const currentProgress = activeType === 'Daily' ? todayProgress : currentWeekProgress;
  const percent = Math.min(Math.round((currentProgress / targetDistance) * 100), 100);
  
  // Weekly progress for chart
  const weeklyProgressMap = new Map<string, number>();
  dummyDailyProgress.forEach(p => {
    const weekStart = getWeekStart(new Date(p.date));
    weeklyProgressMap.set(weekStart, (weeklyProgressMap.get(weekStart) || 0) + p.distance);
  });
  
  const weeklyTargetsMap = new Map<string, number>();
  targetHistory.forEach(h => {
    if (h.type === 'Weekly' && h.startDate) {
      weeklyTargetsMap.set(getWeekStart(new Date(h.startDate)), h.distance);
    }
  });
  
  const weeks = Array.from(weeklyProgressMap.entries()).slice(-6).map(([start, total]) => ({
    start, total, target: weeklyTargetsMap.get(start) || 35
  }));
  
  const maxValue = Math.max(...weeks.map(w => Math.max(w.total, w.target)), 1);
  
  const getLast7Days = () => {
    const last7 = dummyDailyProgress.slice(-7);
    return last7.map(day => ({
      name: formatDayName(day.date),
      distance: day.distance,
      achieved: day.distance >= dailyTarget,
      percent: Math.min(Math.round((day.distance / dailyTarget) * 100), 100)
    }));
  };
  
  const getCurrentWeekDays = () => {
    const weekDays = dummyDailyProgress.filter(p => getWeekStart(new Date(p.date)) === currentWeekStart);
    return weekDays.map(day => ({
      name: formatDayName(day.date),
      distance: day.distance,
      achieved: false,
      percent: Math.min(Math.round((day.distance / (weeklyTarget / 7)) * 100), 100)
    }));
  };
  
  const dailyBreakdown = activeType === 'Daily' ? getLast7Days() : getCurrentWeekDays();
  const streak = dummyDailyProgress.slice(-30).filter(p => p.distance >= dailyTarget).length;
  const bestDay = [...dummyDailyProgress].sort((a,b) => b.distance - a.distance)[0];
  
  const handleSwitch = (type: TargetType) => {
    if (type === activeType) return;
    setPendingType(type);
    setShowConfirm(true);
  };
  
  const confirmSwitch = () => {
    if (pendingType) setActiveType(pendingType);
    setShowConfirm(false);
    setPendingType(null);
  };
  
  const handleSaveTarget = (distance: number) => {
    if (activeType === 'Daily') setDailyTarget(distance);
    else setWeeklyTarget(distance);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-52 p-5">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Fitness Target</h1>
          <p className="text-xs text-gray-400">Daily / Weekly goals</p>
        </div>
        
        {/* Target Toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
          {(['Daily', 'Weekly'] as TargetType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleSwitch(t)}
              className={`px-5 py-1.5 text-sm rounded-md transition-all ${
                activeType === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        
        {/* Main Stats Card */}
        <div className="bg-white rounded-xl border p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 uppercase">{activeType} target</p>
              <p className="text-2xl font-bold">{targetDistance} km</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">progress</p>
              <p className="text-xl font-bold">{percent}%</p>
            </div>
          </div>
          
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div><p className="text-gray-400">Current</p><p className="font-semibold">{currentProgress.toFixed(1)} km</p></div>
            <div><p className="text-gray-400">Remaining</p><p className="font-semibold">{(targetDistance - currentProgress).toFixed(1)} km</p></div>
            <div><p className="text-gray-400">Daily avg</p><p className="font-semibold">{(currentProgress / (activeType === 'Daily' ? 1 : 7)).toFixed(1)} km</p></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm">
            <div><p className="text-gray-400">🔥 Streak</p><p className="font-semibold">{streak} days</p></div>
            <div><p className="text-gray-400">🏆 Best</p><p className="font-semibold">{bestDay?.distance.toFixed(1) || '-'} km</p></div>
          </div>
        </div>
        
        {/* Update Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-2 mb-5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
        >
          ✎ Update {activeType} Target
        </button>
        
        {/* Daily Breakdown - Minimalis Table */}
        <div className="bg-white rounded-xl border mb-5 overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-medium">Daily Breakdown</h3>
          </div>
          <div className="divide-y">
            {dailyBreakdown.map((day, i) => (
              <div key={i} className="px-4 py-2 flex items-center justify-between text-sm">
                <span className="w-16 font-medium text-gray-600">{day.name}</span>
                <span className={`font-mono ${day.achieved ? 'text-green-600' : 'text-gray-700'}`}>
                  {day.distance.toFixed(1)} km
                </span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${day.achieved ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(day.percent, 100)}%` }} />
                </div>
                <span className="w-12 text-right text-xs text-gray-400">{day.percent}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Weekly Chart - Minimalis */}
        <div className="bg-white rounded-xl border p-4 mb-5">
          <h3 className="text-sm font-medium mb-3">Weekly Comparison</h3>
          <div className="flex items-end gap-2 h-40">
            {weeks.map((week) => (
              <div key={week.start} className="flex-1 flex flex-col items-center gap-1">
                <div className="relative flex items-end gap-1 w-full justify-center h-32">
                  <div className="w-6 bg-gray-200 rounded-t" style={{ height: `${(week.target / maxValue) * 100}%` }} />
                  <div className="w-6 bg-orange-500 rounded-t" style={{ height: `${(week.total / maxValue) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-400">{formatDate(week.start)}</span>
                <span className="text-[10px] font-mono">{week.total.toFixed(0)}/{week.target}km</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-3 pt-2 text-[10px] text-gray-400">
            <span>■ Target</span>
            <span className="text-orange-500">■ Actual</span>
          </div>
        </div>
        
        {/* History - Minimalis */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-medium mb-2">History</h3>
          <div className="space-y-2">
            {targetHistory.slice().reverse().map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded ${h.type === 'Daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {h.type}
                </span>
                <span className="text-gray-500">{formatDate(h.startDate)}</span>
                <span className="text-gray-700">{h.distance} km</span>
                {h.endDate && <span className="text-gray-300">→ {formatDate(h.endDate)}</span>}
              </div>
            ))}
          </div>
        </div>
        
        {/* Info Note - Minimalis */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-[11px] text-gray-500">
            💡 <strong>Daily</strong>: consistent daily target | <strong>Weekly</strong>: flexible weekly total
          </p>
        </div>
      </main>
      
      {showModal && (
        <AddTargetModal
          type={activeType}
          currentDistance={targetDistance}
          onSave={handleSaveTarget}
          onClose={() => setShowModal(false)}
        />
      )}
      
      {showConfirm && pendingType && (
        <ConfirmSwitchModal
          fromType={activeType}
          toType={pendingType}
          onConfirm={confirmSwitch}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}