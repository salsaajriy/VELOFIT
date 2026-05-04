'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRideTracker } from '@/hooks/useRideTracker';

// Leaflet must be dynamically imported (no SSR)
const RideMap = dynamic(() => import('@/components/RideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />
  ),
});

// ── Props ──────────────────────────────────────────────────────────────────

interface RideTrackerProps {
  /** Called after a ride is successfully saved */
  onRideSaved?: () => void;
}

// ── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  color = '#f59e0b',
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-1 min-w-0">
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-gray-900 leading-tight">
        {value}
        {unit && (
          <span className="text-xs font-semibold text-gray-400 ml-1">{unit}</span>
        )}
      </p>
      <div
        className="mt-2 h-0.5 w-8 rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RideTracker({ onRideSaved }: RideTrackerProps) {
  const tracker = useRideTracker();
  const [rideName, setRideName] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStart = () => {
    tracker.startRide(rideName || undefined);
    setRideName('');
  };

  const handleFinish = async () => {
    setShowConfirm(false);
    await tracker.finishRide();
    onRideSaved?.();
  };

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (tracker.status === 'idle' || tracker.status === 'error') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900">New Ride</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Name your ride and hit Start
          </p>
        </div>

        {tracker.error && (
          <div className="bg-red-50 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl border border-red-100">
            {tracker.error}
          </div>
        )}

        <input
          type="text"
          value={rideName}
          onChange={(e) => setRideName(e.target.value)}
          placeholder="Enter a name for your ride"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
        />

        <button
          onClick={handleStart}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xs bg-orange-700 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-sm transition-all shadow-md shadow-amber-200"
        >
          {/* Play icon */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
          Start Ride
        </button>
      </div>
    );
  }

  // ── STARTING ──────────────────────────────────────────────────────────────
  if (tracker.status === 'starting') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center gap-3 text-gray-500">
        <svg
          className="w-5 h-5 animate-spin text-amber-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
        </svg>
        <span className="text-sm font-semibold">Starting ride…</span>
      </div>
    );
  }

  // ── TRACKING ──────────────────────────────────────────────────────────────
  if (tracker.status === 'tracking') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col gap-0">
        {/* Map */}
        <div className="h-52 relative">
          <RideMap
            coords={tracker.route.map((p) => [p.lat, p.lng])}
            live
            className="w-full h-full"
          />
          {/* Live badge */}
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 flex flex-col gap-3">
          {/* Timer */}
          <div className="text-center py-2">
            <p className="text-5xl font-black text-gray-900 tabular-nums tracking-tight">
              {tracker.formattedElapsed}
            </p>
            <p className="text-xs text-gray-400 font-semibold mt-1 uppercase tracking-widest">
              Elapsed
            </p>
          </div>

          {/* Metric cards */}
          <div className="flex gap-3">
            <StatCard
              label="Distance"
              value={tracker.distance.toFixed(2)}
              unit="km"
              color="#22c55e"
            />
            <StatCard
              label="Speed"
              value={tracker.speed.toFixed(1)}
              unit="km/h"
              color="#f59e0b"
            />
            <StatCard
              label="Calories"
              value={tracker.calories}
              unit="kcal"
              color="#ef4444"
            />
          </div>

          {/* GPS status */}
          <p className="text-center text-xs text-gray-400 font-semibold">
            {tracker.route.length === 0
              ? '📡 Acquiring GPS signal…'
              : `📍 ${tracker.route.length} GPS points recorded`}
          </p>

          {/* Finish button */}
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-gray-700 active:scale-[0.98] text-white font-black text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
              Finish Ride
            </button>
          ) : (
            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm font-bold text-gray-800 text-center">
                End this ride?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Keep Going
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-black text-sm transition-colors"
                >
                  Yes, Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FINISHING ─────────────────────────────────────────────────────────────
  if (tracker.status === 'finishing') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-3">
        <svg
          className="w-8 h-8 animate-spin text-amber-500"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20" />
        </svg>
        <p className="text-sm font-black text-gray-700">Saving your ride…</p>
        <p className="text-xs text-gray-400">Uploading GPS data and stats</p>
      </div>
    );
  }

  // ── DONE — ride summary ───────────────────────────────────────────────────
  if (tracker.status === 'done' && tracker.finishedRide) {
    const ride = tracker.finishedRide;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Map */}
        {ride.routeCoords.length > 0 && (
          <div className="h-48">
            <RideMap
              coords={ride.routeCoords}
              className="w-full h-full"
            />
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-black text-green-500 uppercase tracking-widest mb-0.5">
                ✓ Ride Saved
              </p>
              <h3 className="text-xl font-black text-gray-900">{ride.name}</h3>
              <p className="text-xs text-gray-400">{ride.date}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-600">
              {ride.status}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Distance', value: ride.distance },
              { label: 'Duration', value: ride.duration },
              { label: 'Avg Speed', value: `${ride.avgSpeed.toFixed(1)} km/h` },
              { label: 'Calories', value: `${ride.calories} kcal` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-0.5">
                  {label}
                </p>
                <p className="text-base font-black text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={tracker.reset}
            className="w-full py-3 rounded-xl bg-orange hover:bg-amber-400 text-white font-black text-sm transition-all"
          >
            Start New Ride
          </button>
        </div>
      </div>
    );
  }

  return null;
}