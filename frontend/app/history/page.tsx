'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/sidebar';
import { rideService } from '@/services/rideService';
import type { RideHistoryItem, RideDetail } from '@/types/ride';
import { Clock, Navigation, Activity, Flame, MapPin, Award, ChevronRight, Trash } from 'lucide-react';

const RideMap = dynamic(() => import('@/components/RideMap'), { ssr: false });

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  completed:  { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed'  },
  active:     { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Active'     },
  paused:     { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused'     },
  abandoned:  { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Abandoned'  },
};

const TIME_FILTERS: Record<string, number> = {
  'Last 7 Days':   7,
  'Last 30 Days':  30,
  'Last 3 Months': 90,
  'All Time':      Infinity,
};

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}h ${m}m`;
  }

  if (m > 0) {
    return `${m}m`;
  }

  return `${s}s`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return '—'; }
}

function fmt(v: number, d = 1): string {
  return !v || isNaN(v) ? '0' : v.toFixed(d);
}

function getModeDisplay(mode: string) {
  return mode === 'navigation'
    ? { label: 'Navigation', icon: <Navigation className="w-3.5 h-3.5" />, color: 'text-orange-500' }
    : { label: 'Free Ride',  icon: <Activity   className="w-3.5 h-3.5" />, color: 'text-gray-500'   };
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4
                    border-b border-gray-50 animate-pulse">
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-32 bg-gray-100 rounded-full" />
        <div className="h-3 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="h-3.5 w-16 bg-gray-100 rounded-full" />
      <div className="h-3.5 w-12 bg-gray-100 rounded-full" />
      <div className="h-6  w-20 bg-gray-100 rounded-full" />
      <div className="w-4  h-4  bg-gray-100 rounded" />
    </div>
  );
}

function StatCard({
  icon, label, value, unit, colSpan = 1,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  colSpan?: number;
}) {
  return (
    <div className={`bg-gray-50 rounded-xl p-3 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-xl font-black text-gray-900">
        {value}
        {unit && <span className="text-xs font-semibold text-gray-400"> {unit}</span>}
      </p>
    </div>
  );
}

export default function HistoryPage() {
  const [rides,        setRides]        = useState<RideHistoryItem[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [loadingDetail,setLoadingDetail]= useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(false);
  const [totalRides,   setTotalRides]   = useState(0);

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [timeFilter,   setTimeFilter]   = useState('Last 30 Days');

  const [selectedRide,       setSelectedRide]       = useState<RideHistoryItem | null>(null);
  const [selectedRideDetail, setSelectedRideDetail] = useState<RideDetail | null>(null);
  const [mapExpanded,        setMapExpanded]        = useState(false);

  const fetchHistory = useCallback(async (
    pageNum: number,
    isLoadMore = false,
  ) => {
    isLoadMore ? setLoadingMore(true) : setIsLoading(true);
    setFetchError(null);

    try {
      const response = await rideService.getHistory(pageNum);
      const { data: newRides, meta } = response;

      setRides(prev => pageNum === 1 ? newRides : [...prev, ...newRides]);

      if (meta) {
        setTotalRides(meta.total ?? 0);
        setHasMore(pageNum < (meta.last_page ?? 1));
      } else {
        setHasMore(newRides.length === 15);
      }

      if (pageNum === 1 && newRides.length > 0) {
        setSelectedRide(newRides[0]);
        fetchDetail(newRides[0].id);
      }
    } catch (err: unknown) {
      setFetchError((err as { message?: string })?.message ?? 'Gagal memuat riwayat.');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchDetail = async (rideId: number) => {
    setLoadingDetail(true);
    setSelectedRideDetail(null);
    try {
      const detail = await rideService.getRideDetail(rideId);
      setSelectedRideDetail(detail);
    } catch (err) {
      console.error('Detail fetch failed:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);

  const handleSelect = (ride: RideHistoryItem) => {
    setSelectedRide(ride);
    fetchDetail(ride.id);
  };

  const handleDeleteRide = async (rideId: number) => {
    const firstConfirm = window.confirm(
      'Are you sure you want to delete this trip? This action cannot be undone.'
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      'Data ride will be removed from history. Continue?'
    );

    if (!secondConfirm) return;

    try {
      await rideService.deleteRide(rideId);

      setRides((prev) =>
        prev.filter((ride) => ride.id !== rideId)
      );

      if (selectedRide?.id === rideId) {
        setSelectedRide(null);
        setSelectedRideDetail(null);
      }
    } catch {
      alert('Failed to delete the ride. Please try again.');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchHistory(next, true);
    }
  };

  const filterDays = TIME_FILTERS[timeFilter] ?? 30;
  const cutoff = filterDays === Infinity
    ? null
    : new Date(Date.now() - filterDays * 86_400_000);

  const filtered = rides.filter((r) => {
    const matchSearch =
      r.mode.toLowerCase().includes(search.toLowerCase()) ||
      formatDate(r.started_at).toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'All' || r.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchTime = !cutoff || new Date(r.started_at) >= cutoff;
    return matchSearch && matchStatus && matchTime;
  });

  const totals = rides.reduce(
    (acc, r) => ({
      distance: acc.distance + (r.distance  || 0),
      duration: acc.duration + (r.duration  || 0),
      calories: acc.calories + (r.calories  || 0),
    }),
    { distance: 0, duration: 0, calories: 0 },
  );

  const mapCoords: [number, number][] =
    selectedRideDetail?.locations?.map(l => [l.lat, l.lng]) ?? [];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 flex flex-col overflow-hidden">
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Activity History</h1>
              <p className="text-sm text-gray-400 mt-1">
                Review and analyze your past cycling sessions
              </p>
            </div>
            {totalRides > 0 && (
              <div className="bg-orange-100 px-3 py-1.5 rounded-full">
                <span className="text-sm font-bold text-orange-700">
                  {totalRides} rides
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Banner */}
        {rides.length > 0 && (
          <div className="mx-8 mb-4 bg-linear-to-r from-orange-500 to-orange-600
                          rounded-2xl p-4 text-white shadow-lg">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs font-medium opacity-80 mb-0.5">Total Rides</p>
                <p className="text-2xl font-black">{totalRides || rides.length}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <MapPin className="w-3.5 h-3.5 opacity-80" />
                  <p className="text-2xl font-black">{fmt(totals.distance, 1)}</p>
                </div>
                <p className="text-xs opacity-80">km total</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5 opacity-80" />
                  <p className="text-xl font-black">{formatDuration(totals.duration)}</p>
                </div>
                <p className="text-xs opacity-80">total time</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Flame className="w-3.5 h-3.5 opacity-80" />
                  <p className="text-2xl font-black">{fmt(totals.calories, 0)}</p>
                </div>
                <p className="text-xs opacity-80">kcal</p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="px-8 pb-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by mode or date…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                         text-sm placeholder-gray-400 focus:outline-none focus:border-orange-400
                         focus:ring-2 focus:ring-orange-100 transition-all shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                       font-semibold text-gray-600 focus:outline-none focus:ring-2
                       focus:ring-orange-100 shadow-sm cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="abandoned">Abandoned</option>
          </select>

          <select
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                       font-semibold text-gray-600 focus:outline-none focus:ring-2
                       focus:ring-orange-100 shadow-sm cursor-pointer"
          >
            {Object.keys(TIME_FILTERS).map(k => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {fetchError && (
          <div className="mx-8 mb-4 bg-red-50 border border-red-100 text-red-600
                          text-sm font-semibold px-4 py-3 rounded-xl flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 shrink-0">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4M12 16h.01" strokeLinecap="round"/>
            </svg>
            {fetchError}
            <button
              onClick={() => fetchHistory(1)}
              className="ml-auto underline text-xs"
            >
              Retry
            </button>
          </div>
        )}

        <div className="flex flex-1 gap-5 px-8 pb-8 overflow-hidden min-h-0">
          {/* ── Ride list ────────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm
                          overflow-hidden flex flex-col min-w-0">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3
                            border-b border-gray-100 bg-gray-50/80">
              {['DATE & MODE', 'DISTANCE', 'DURATION', 'STATUS', ''].map(h => (
                <span key={h}
                  className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)

              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Award className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="text-sm font-bold">
                    {rides.length === 0 ? 'No rides yet' : 'No rides match your filters'}
                  </p>
                  <p className="text-xs mt-1 text-gray-300">
                    {rides.length === 0
                      ? 'Complete your first ride to see history'
                      : 'Try adjusting your search or filters'}
                  </p>
                </div>

              ) : (
                <>
                  {filtered.map(ride => {
                    const isSelected  = selectedRide?.id === ride.id;
                    const modeDisplay = getModeDisplay(ride.mode);
                    const statusInfo  =
                      STATUS_CONFIG[ride.status?.toLowerCase()] ?? STATUS_CONFIG.completed;

                    return (
                      <button
                        key={ride.id}
                        onClick={() => handleSelect(ride)}
                        className={[
                          'w-full grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center',
                          'px-5 py-4 border-b border-gray-50 text-left transition-colors',
                          isSelected ? 'bg-orange-50/80' : 'hover:bg-gray-50/60',
                        ].join(' ')}
                      >
                        {/* Date & Mode */}
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={[
                            'w-0.5 self-stretch rounded-full shrink-0 mt-0.5',
                            isSelected ? 'bg-orange-500' : 'bg-transparent',
                          ].join(' ')} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={modeDisplay.color}>{modeDisplay.icon}</span>
                              <p className="text-sm font-bold text-gray-900 leading-tight">
                                {modeDisplay.label}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {formatDate(ride.started_at)}
                            </p>
                          </div>
                        </div>

                        {/* Distance */}
                        <span className="text-sm font-semibold text-gray-700">
                          {fmt(ride.distance, 1)} km
                        </span>

                        {/* Duration */}
                        <span className="text-sm text-gray-600">
                          {formatDuration(ride.duration)}
                        </span>

                        {/* Status */}
                        <span className={[
                          'inline-flex w-fit px-2.5 py-1 rounded-full text-xs font-bold',
                          statusInfo.bg, statusInfo.text,
                        ].join(' ')}>
                          {statusInfo.label}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRide(ride.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="w-4 h-4" />
                          </span>

                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </button>
                    );
                  })}

                  {/* Load More */}
                  {hasMore && (
                    <div className="p-4">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600
                                   text-white text-sm font-semibold transition-all
                                   disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {loadingMore ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent
                                             rounded-full animate-spin" />
                            Loading…
                          </span>
                        ) : 'Muat Lebih Banyak'}
                      </button>
                    </div>
                  )}

                  {!hasMore && rides.length > 0 && (
                    <div className="py-6 text-center">
                      <span className="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                        Semua {totalRides || rides.length} aktivitas ditampilkan
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="w-80 shrink-0 flex flex-col gap-4">
            {/* Map Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-black text-gray-800">Route View</span>
                <button
                  onClick={() => setMapExpanded(v => !v)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700
                             hover:bg-gray-100 transition-colors"
                  aria-label="Toggle map size"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" className="w-4 h-4">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0
                             18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
                      strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <div className={`transition-all duration-300 ${mapExpanded ? 'h-64' : 'h-44'}`}>
                {loadingDetail ? (
                  <div className="w-full h-full bg-gray-50 animate-pulse flex
                                  items-center justify-center">
                    <p className="text-xs text-gray-400">Loading route…</p>
                  </div>
                ) : mapCoords.length > 0 ? (
                  <RideMap
                    coords={mapCoords}
                    mode="history"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex flex-col
                                  items-center justify-center gap-2">
                    <MapPin className="w-8 h-8 text-gray-300" />
                    <p className="text-xs text-gray-400 font-semibold text-center px-4">
                      Select a ride to view route
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail Card */}
            {selectedRideDetail ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {/* Title */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={getModeDisplay(selectedRideDetail.mode).color}>
                        {getModeDisplay(selectedRideDetail.mode).icon}
                      </span>
                      <h3 className="text-base font-black text-gray-900">
                        {getModeDisplay(selectedRideDetail.mode).label}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDate(selectedRideDetail.started_at)}
                    </p>
                  </div>
                  <span className={[
                    'px-2 py-1 rounded-full text-xs font-bold shrink-0',
                    STATUS_CONFIG[selectedRideDetail.status?.toLowerCase()]?.bg ?? 'bg-gray-100',
                    STATUS_CONFIG[selectedRideDetail.status?.toLowerCase()]?.text ?? 'text-gray-600',
                  ].join(' ')}>
                    {STATUS_CONFIG[selectedRideDetail.status?.toLowerCase()]?.label
                      ?? selectedRideDetail.status}
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-3.5 h-3.5"><path d="M3 3v18h18" strokeLinecap="round"/><path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    label="Distance"
                    value={fmt(selectedRideDetail.distance, 1)}
                    unit="km"
                  />
                  <StatCard
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></svg>}
                    label="Duration"
                    value={formatDuration(selectedRideDetail.duration)}
                  />
                  <StatCard
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></svg>}
                    label="Avg Speed"
                    value={fmt(selectedRideDetail.avg_speed, 1)}
                    unit="km/h"
                  />
                  <StatCard
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/></svg>}
                    label="Max Speed"
                    value={fmt(selectedRideDetail.max_speed, 1)}
                    unit="km/h"
                  />
                  <StatCard
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 2C8 2 4 5 4 9c0 4.5 4 9 8 11 4-2 8-6.5 8-11 0-4-4-7-8-7z"/></svg>}
                    label="Calories"
                    value={fmt(selectedRideDetail.calories, 0)}
                    unit="kcal"
                    colSpan={2}
                  />
                </div>

                {/* Alerts */}
                {selectedRideDetail.alerts?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-2">⚠️ Alerts</p>
                    {selectedRideDetail.alerts.map((a, i) => (
                      <div key={i}
                        className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-1">
                        {a.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                              p-8 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Award className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">
                    {loadingDetail ? 'Loading…' : 'Select a ride to view details'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}