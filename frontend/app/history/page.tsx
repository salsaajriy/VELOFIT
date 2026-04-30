'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/sidebar';
import { apiGetHistory } from '@/lib/api/rides';
import type { Ride, RideStatus } from '@/lib/api/rides';

// Leaflet is SSR-incompatible — load it only on the client
const RideMap = dynamic(() => import('@/components/RideMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse" />
  ),
});

// ── Status badge config ────────────────────────────────────────────────────

const statusConfig: Record<RideStatus, { bg: string; text: string }> = {
  Completed:   { bg: 'bg-green-100', text: 'text-green-600' },
  Incompleted: { bg: 'bg-red-100',   text: 'text-red-500'   },
};

// ── Skeleton loader ────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4 border-b border-gray-50 animate-pulse">
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-32 bg-gray-100 rounded-full" />
        <div className="h-3 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3.5 w-16 bg-gray-100 rounded-full" />
      <div className="h-3.5 w-12 bg-gray-100 rounded-full" />
      <div className="h-6 w-20 bg-gray-100 rounded-full" />
      <div className="w-4 h-4 bg-gray-100 rounded" />
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [rides, setRides]             = useState<Ride[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RideStatus>('All');
  const [timeFilter, setTimeFilter]   = useState('Last 30 Days');
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [mapExpanded, setMapExpanded] = useState(false);

  // ── Fetch history ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = await apiGetHistory();
        if (!cancelled) {
          setRides(data);
          if (data.length > 0) setSelectedRide(data[0]);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : 'Failed to load rides.',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Filter ─────────────────────────────────────────────────────────────
  const filtered = rides.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.date.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 flex flex-col overflow-hidden">
        {/* ── Page Header ─────────────────────────────────────────── */}
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-black text-gray-900">Activity History</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and analyze your past cycling sessions
          </p>
        </div>

        {/* ── Search & Filters ────────────────────────────────────── */}
        <div className="px-8 pb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by route name or date"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | RideStatus)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-100 shadow-sm cursor-pointer"
          >
            <option value="All">Status ↓</option>
            <option value="Completed">Completed</option>
            <option value="Incompleted">Incompleted</option>
          </select>

          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-100 shadow-sm cursor-pointer"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 3 Months</option>
            <option>All Time</option>
          </select>
        </div>

        {/* ── Error banner ────────────────────────────────────────── */}
        {fetchError && (
          <div className="mx-8 mb-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
            </svg>
            {fetchError}
            <button
              onClick={() => window.location.reload()}
              className="ml-auto underline text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Content Area ────────────────────────────────────────── */}
        <div className="flex flex-1 gap-5 px-8 pb-8 overflow-hidden min-h-0">

          {/* ── Ride List ─────────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-w-0">

            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3 border-b border-gray-100">
              {['DATE & ROUTE', 'DISTANCE', 'DURATION', 'STATUS', ''].map((h) => (
                <span
                  key={h}
                  className="text-xs font-black text-gray-400 uppercase tracking-widest"
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)

              ) : filtered.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-10 h-10 mb-3 text-gray-300"
                  >
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm font-bold">
                    {rides.length === 0 ? 'No rides yet' : 'No rides match your filters'}
                  </p>
                  <p className="text-xs mt-1 text-gray-300">
                    {rides.length === 0
                      ? 'Start your first ride to see history here'
                      : 'Try adjusting your search or status filter'}
                  </p>
                </div>

              ) : (
                // Ride rows
                filtered.map((ride) => {
                  const isSelected = selectedRide?.id === ride.id;
                  const s = statusConfig[ride.status];
                  return (
                    <button
                      key={ride.id}
                      onClick={() => setSelectedRide(ride)}
                      className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4 border-b border-gray-50 text-left transition-colors ${
                        isSelected ? 'bg-amber-50/60' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Date & Route */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-0.5 self-stretch rounded-full shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500' : 'bg-transparent'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                            {ride.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{ride.date}</p>
                        </div>
                      </div>

                      {/* Distance */}
                      <span className="text-sm font-semibold text-gray-700">
                        {ride.distance}
                      </span>

                      {/* Duration */}
                      <span className="text-sm text-gray-600">{ride.duration}</span>

                      {/* Status */}
                      <span
                        className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}
                      >
                        {ride.status}
                      </span>

                      {/* Chevron */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-4 h-4 text-gray-300"
                      >
                        <path
                          d="m9 18 6-6-6-6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Route Detail Panel ──────────────────────────────── */}
          <div className="w-72 shrink-0 flex flex-col gap-4">

            {/* Map Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-black text-gray-800">Route View</span>
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Expand map"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-4 h-4"
                  >
                    <path
                      d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Leaflet map — renders real route polyline */}
              <div
                className={`relative transition-all duration-300 ${
                  mapExpanded ? 'h-64' : 'h-44'
                }`}
              >
                {selectedRide ? (
                  <RideMap
                    coords={selectedRide.routeCoords}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                    <p className="text-xs text-gray-400 font-semibold">
                      Select a ride to view route
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Ride Detail Card */}
            {selectedRide ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-xl font-black text-gray-900 leading-tight">
                    {selectedRide.name}
                  </h3>
                  {selectedRide.status === 'Completed' ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      className="w-6 h-6 shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      className="w-6 h-6 shrink-0 mt-0.5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                    </svg>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Ride ID: #{selectedRide.id}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {/* Avg Speed */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-3.5 h-3.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Avg Speed
                      </span>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      {selectedRide.avgSpeed.toFixed(1)}{' '}
                      <span className="text-xs font-semibold text-gray-400">km/h</span>
                    </p>
                  </div>

                  {/* Calories */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M12 2C8 2 4 5 4 9c0 4.5 4 9 8 11 4-2 8-6.5 8-11 0-4-4-7-8-7z" />
                      </svg>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Calories
                      </span>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      {selectedRide.calories}
                      <span className="text-xs font-semibold text-gray-400"> kcal</span>
                    </p>
                  </div>

                  {/* Distance */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-3.5 h-3.5">
                        <path d="M3 3v18h18" strokeLinecap="round" />
                        <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Distance
                      </span>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      {selectedRide.distance}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="w-3.5 h-3.5">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 3" strokeLinecap="round" />
                      </svg>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        Duration
                      </span>
                    </div>
                    <p className="text-xl font-black text-gray-900">
                      {selectedRide.duration}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center text-gray-400">
                <p className="text-sm font-semibold text-center">
                  Select a ride to<br />view details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}