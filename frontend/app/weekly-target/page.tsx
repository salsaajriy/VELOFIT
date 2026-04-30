'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

type Period = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

interface Target {
  distance: number;   // km
  duration: string;   // "HH:MM"
  calories: number;   // kcal
}

interface ProgressMetric {
  label: string;
  current: number | string;
  target: number | string;
  unit: string;
  percent: number;
  color: string;
  currentColor: string;
}

interface DayBar {
  day: string;
  activity: number; // 0–100
  target: number;   // 0–100
}

// ── Helper ─────────────────────────────────────────────────────────────────

function durationToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

// ── Progress Bar ───────────────────────────────────────────────────────────

function ProgressBar({
  label,
  current,
  target,
  unit,
  percent,
  color,
  currentColor,
}: ProgressMetric) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className="text-sm font-semibold">
          <span style={{ color: currentColor }} className="font-black">
            {current}
          </span>
          <span className="text-gray-400 mx-1">/</span>
          <span className="text-gray-500 font-bold">{target}</span>
          <span className="text-gray-400 text-xs ml-1">{unit}</span>
        </span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(percent, 100)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────────────────

function ActivityChart({ bars }: { bars: DayBar[] }) {
  return (
    <div className="flex items-end justify-between gap-2 h-44 px-2">
      {bars.map((bar) => (
        <div key={bar.day} className="flex flex-col items-center gap-1.5 flex-1">
          {/* Bar group */}
          <div className="flex items-end gap-1 w-full justify-center" style={{ height: '140px' }}>
            {/* Target bar (gray) */}
            <div
              className="w-5 rounded-t-md bg-gray-200 transition-all duration-500"
              style={{ height: `${bar.target}%` }}
            />
            {/* Activity bar (orange gradient) */}
            <div
              className="w-5 rounded-t-md transition-all duration-500"
              style={{
                height: `${bar.activity}%`,
                background: 'linear-gradient(to top, #e8571e, #f0a500)',
              }}
            />
          </div>
          {/* Day label */}
          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
            {bar.day}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Add Target Modal ───────────────────────────────────────────────────────

interface AddTargetModalProps {
  period: Period;
  currentTarget: Target;
  onSave: (t: Target) => void;
  onClose: () => void;
}

function AddTargetModal({ period, currentTarget, onSave, onClose }: AddTargetModalProps) {
  const [distance, setDistance] = useState(String(currentTarget.distance));
  const [duration, setDuration] = useState(currentTarget.duration);
  const [calories, setCalories] = useState(String(currentTarget.calories));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700)); // simulate save
    onSave({
      distance: Number(distance) || 0,
      duration: duration || '00:00',
      calories: Number(calories) || 0,
    });
    setSaving(false);
    setSaved(true);
    await new Promise((r) => setTimeout(r, 600));
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900">Set {period} Target</h2>
              <p className="text-xs text-gray-400 mt-0.5">Define your performance goals</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="px-6 py-5 space-y-5">

            {/* Distance */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Distance Target
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="150"
                  className="w-full px-4 py-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                  km
                </span>
              </div>
              {/* Quick select pills */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[50, 100, 150, 200].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDistance(String(v))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      distance === String(v)
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={
                      distance === String(v)
                        ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' }
                        : {}
                    }
                  >
                    {v} km
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Duration Target
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                  hr
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {['01:00', '02:00', '04:00', '08:00'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDuration(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      duration === v
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={
                      duration === v
                        ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' }
                        : {}
                    }
                  >
                    {v}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xs text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="flex-1 py-3 rounded-xs text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-80"
              style={{
                background: saved
                  ? '#22c55e'
                  : 'linear-gradient(135deg, #e8571e, #f0a500)',
              }}
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Saved!
                </>
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

// ── Page ───────────────────────────────────────────────────────────────────

const periods: Period[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const defaultTargets: Record<Period, Target> = {
  Daily:   { distance: 20,  duration: '01:00', calories: 700  },
  Weekly:  { distance: 150, duration: '08:00', calories: 4500 },
  Monthly: { distance: 600, duration: '32:00', calories: 18000 },
  Yearly:  { distance: 7200, duration: '400:00', calories: 216000 },
};

const currentProgress = {
  distance: 124.5,
  durationMinutes: 312, // 05:12
  calories: 3240,
};

const dayBars: DayBar[] = [
  { day: 'MON', activity: 35, target: 55 },
  { day: 'TUE', activity: 72, target: 55 },
  { day: 'WED', activity: 22, target: 55 },
  { day: 'THU', activity: 68, target: 55 },
  { day: 'FRI', activity: 48, target: 55 },
  { day: 'SAT', activity: 90, target: 55 },
  { day: 'SUN', activity: 18, target: 55 },
];

export default function WeeklyTargetPage() {
  const [period, setPeriod] = useState<Period>('Weekly');
  const [targets, setTargets] = useState<Record<Period, Target>>(defaultTargets);
  const [showModal, setShowModal] = useState(false);

  const t = targets[period];

  const distancePct = Math.round((currentProgress.distance / t.distance) * 100);
  const durationTargetMin = durationToMinutes(t.duration);
  const durationPct = Math.round((currentProgress.durationMinutes / durationTargetMin) * 100);
  const caloriesPct = Math.round((currentProgress.calories / t.calories) * 100);

  const metrics: ProgressMetric[] = [
    {
      label: 'Distance',
      current: currentProgress.distance,
      target: t.distance,
      unit: 'km',
      percent: distancePct,
      color: 'linear-gradient(90deg,#e8571e,#f0a500)',
      currentColor: '#e8571e',
    },
    {
      label: 'Duration',
      current: minutesToHHMM(currentProgress.durationMinutes),
      target: t.duration,
      unit: 'hr',
      percent: durationPct,
      color: 'linear-gradient(90deg,#856b00,#b8950a)',
      currentColor: '#856b00',
    },
    {
      label: 'Calories',
      current: currentProgress.calories.toLocaleString(),
      target: t.calories.toLocaleString(),
      unit: 'kcal',
      percent: caloriesPct,
      color: 'linear-gradient(90deg,#c0392b,#e74c3c)',
      currentColor: '#c0392b',
    },
  ];

  const handleSave = (newTarget: Target) => {
    setTargets((prev) => ({ ...prev, [period]: newTarget }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
          <h1 className="text-3xl font-black text-gray-900">Weekly Target</h1>
        </div>

        {/* ── Period Tabs + Add Button ─────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          {/* Tabs */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  period === p
                    ? 'text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                style={
                  period === p
                    ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' }
                    : {}
                }
              >
                {p}
              </button>
            ))}
          </div>

          {/* Add Target Button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xs font-bold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg,#e8571e,#c0390e)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add Target
          </button>
        </div>

        {/* ── Progress Card ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 mb-5">
          {/* Period + completion badge */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                {period} Progress
              </p>
              <p className="text-sm text-gray-500">
                Targets set for this {period.toLowerCase()} period
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-xs font-bold text-orange-600">
                {Math.round((distancePct + durationPct + caloriesPct) / 3)}% Overall
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {metrics.map((m) => (
              <ProgressBar key={m.label} {...m} />
            ))}
          </div>
        </div>

        {/* ── Activity vs Target Chart ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-base font-black text-gray-900">Activity vs Target</h2>
              <p className="text-xs text-gray-400 mt-0.5">Current week comparison</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#e8571e,#f0a500)' }}
                />
                <span className="text-xs font-semibold text-gray-500">Activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-xs font-semibold text-gray-500">Target</span>
              </div>
            </div>
          </div>

          <ActivityChart bars={dayBars} />
        </div>

      </main>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      {showModal && (
        <AddTargetModal
          period={period}
          currentTarget={targets[period]}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}