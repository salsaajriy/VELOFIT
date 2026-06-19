'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { useTarget } from '@/hooks/useTarget';
import type { TargetType } from '@/types/target';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

function formatDayName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
}

// ── Add Target Modal ───────────────────────────────────────────────────────
function AddTargetModal({ type, currentDistance, onSave, onClose }: {
  type: TargetType;
  currentDistance: number;
  onSave: (distance: number) => Promise<void>;
  onClose: () => void;
}) {
  const [distance, setDistance] = useState(String(currentDistance));
  const [saving, setSaving] = useState(false);
  const label = type === 'daily' ? 'Daily' : 'Weekly';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(Number(distance) || 0);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl">
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
            <h2 className="font-semibold text-gray-900">Set {label} Target</h2>
            <button onClick={onClose} className="text-gray-900 hover:text-gray-600">✕</button>
          </div>
          <div className="p-5">
            <label className="text-xs font-medium text-gray-900 uppercase">Distance (km)</label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900"
            />
            <div className="flex gap-2 mt-3">
              {(type === 'daily' ? [3, 5, 8, 10] : [20, 30, 40, 50]).map((v) => (
                <button key={v} onClick={() => setDistance(String(v))} className="px-3 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900">
                  {v} km{type === 'weekly' && '/wk'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 p-5 pt-0">
            <button onClick={onClose} className="flex-1 py-2 text-sm border rounded-lg text-gray-900">Cancel</button>
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
  const label = (t: TargetType) => (t === 'daily' ? 'Daily' : 'Weekly');
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-72 bg-white rounded-xl p-5 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-lg">⟳</div>
          <h3 className="font-semibold text-gray-900 mb-1">Switch View?</h3>
          <p className="text-xs text-gray-900 mb-4">Switch from {label(fromType)} to {label(toType)} view?</p>
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2 text-sm border rounded-lg text-gray-900">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-2 text-sm text-white bg-orange-500 rounded-lg">Switch</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TargetPage() {
  const [activeType, setActiveType] = useState<TargetType>('daily');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingType, setPendingType] = useState<TargetType | null>(null);

  const {
    activeTarget, history, dailyBreakdown, weeklyBreakdown, stats,
    loading, error, setTarget,
  } = useTarget(activeType);

  const targetDistance = activeTarget?.distance ?? (activeType === 'daily' ? 5 : 35);
  const currentProgress = activeTarget?.progress.current ?? 0;
  const remaining = activeTarget?.progress.remaining ?? targetDistance;
  const percent = activeTarget?.progress.percent ?? 0;

  const maxValue = Math.max(...weeklyBreakdown.map((w) => Math.max(w.total, w.target ?? 0)), 1);

  const dailyTargetForBreakdown = activeType === 'daily' ? targetDistance : targetDistance / 7;

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

  const handleSaveTarget = async (distance: number) => {
    await setTarget(activeType, distance);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-52 p-5">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Fitness Target</h1>
          <p className="text-xs text-gray-900">Daily / Weekly goals</p>
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <div className='grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm'>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-5">
            {(['daily', 'weekly'] as TargetType[]).map((t) => (
                <button
                key={t}
                onClick={() => handleSwitch(t)}
                className={`px-5 py-1.5 text-sm rounded-md transition-all ${
                    activeType === t ? 'bg-white shadow text-gray-900' : 'text-gray-900'
                }`}
                >
                {t === 'daily' ? 'Daily' : 'Weekly'}
                </button>
            ))} 
            </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full py-2 mb-5 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50"
                        >
                    ✎ Update {activeType === 'daily' ? 'Daily' : 'Weekly'} Target
                </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-900">Loading…</p>
        ) : (
          <>
            <div className="bg-white rounded-xl border p-5 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-900 uppercase">{activeType} target</p>
                  <p className="text-2xl font-bold text-gray-900">{targetDistance} km</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-900">progress</p>
                  <p className="text-xl font-bold text-gray-900">{percent}%</p>
                </div>
              </div>

              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div><p className="text-gray-900">Current</p><p className="font-semibold text-gray-900">{currentProgress.toFixed(1)} km</p></div>
                <div><p className="text-gray-900">Remaining</p><p className="font-semibold text-gray-900">{remaining.toFixed(1)} km</p></div>
                <div><p className="text-gray-900">Daily avg</p><p className="font-semibold text-gray-900">{(currentProgress / (activeType === 'daily' ? 1 : 7)).toFixed(1)} km</p></div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-sm">
                <div><p className="text-gray-900">🔥 Streak</p><p className="font-semibold text-gray-900">{stats?.streak ?? 0} days</p></div>
                <div><p className="text-gray-900">🏆 Best</p><p className="font-semibold text-gray-900">{stats?.best_day?.distance.toFixed(1) ?? '-'} km</p></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border mb-5 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-medium text-gray-900">Daily Breakdown</h3>
              </div>
              <div className="divide-y">
                {(activeType === 'daily' ? dailyBreakdown.slice(-7) : dailyBreakdown.slice(-7)).map((day) => {
                  const dayPercent = Math.min(Math.round((day.distance / dailyTargetForBreakdown) * 100), 100);
                  const achieved = activeType === 'daily' && day.distance >= targetDistance;
                  return (
                    <div key={day.date} className="px-4 py-2 flex items-center justify-between text-sm">
                      <span className="w-16 font-medium text-gray-900">{formatDayName(day.date)}</span>
                      <span className={`font-mono ${achieved ? 'text-green-600' : 'text-gray-900'}`}>
                        {day.distance.toFixed(1)} km
                      </span>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${achieved ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${dayPercent}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-900">{dayPercent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4 mb-5">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Weekly Comparison</h3>
              <div className="flex items-end gap-2 h-40">
                {weeklyBreakdown.map((week) => (
                  <div key={week.week_start} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative flex items-end gap-1 w-full justify-center h-32">
                      <div className="w-6 bg-gray-200 rounded-t" style={{ height: `${((week.target ?? 0) / maxValue) * 100}%` }} />
                      <div className="w-6 bg-orange-500 rounded-t" style={{ height: `${(week.total / maxValue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-900">{formatDate(week.week_start)}</span>
                    <span className="text-[10px] font-mono text-gray-900">{week.total.toFixed(0)}/{week.target ?? '-'}km</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-3 pt-2 text-[10px] text-gray-900">
                <span>■ Target</span>
                <span className="text-orange-500">■ Actual</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">History</h3>
              {history.length === 0 ? (
                <p className="text-xs text-gray-900">No previous targets yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center gap-2 text-xs">
                      <span className={`px-1.5 py-0.5 rounded ${h.type === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {h.type === 'daily' ? 'Daily' : 'Weekly'}
                      </span>
                      <span className="text-gray-900">{formatDate(h.start_date)}</span>
                      <span className="text-gray-900">{h.distance} km</span>
                      {h.end_date && <span className="text-gray-900">→ {formatDate(h.end_date)}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-[11px] text-gray-900">
                💡 <strong>Daily</strong>: consistent daily target | <strong>Weekly</strong>: flexible weekly total
              </p>
            </div>
          </>
        )}
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