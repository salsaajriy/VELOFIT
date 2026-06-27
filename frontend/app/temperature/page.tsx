'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/services/api';
import { 
  Calendar, 
  Thermometer,
  AlertTriangle,
  ChevronLeft, 
  ChevronRight,
  Activity
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
type Ride = {
  id: number;
  distance: number;
  duration: number | null;
  start_time: string;
  status: string;
  helmet?: {
    helmet_name: string;
  };
};

type SensorReading = {
  body_temperature: number;
  recorded_at: string;
};

type RideDetail = {
  id: number;
  sensor_readings: SensorReading[];
};

// ── Helpers ──────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getTemperatureStats(readings: SensorReading[]): {
  avg: number;
  max: number;
  min: number;
  latest: number;
  status: 'Critical' | 'Warning' | 'Normal';
  criticalCount: number;
  warningCount: number;
} {
  if (!readings || readings.length === 0) {
    return {
      avg: 0,
      max: 0,
      min: 0,
      latest: 0,
      status: 'Normal',
      criticalCount: 0,
      warningCount: 0,
    };
  }

  const temps = readings.map(r => r.body_temperature);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const latest = temps[temps.length - 1];

  let status: 'Critical' | 'Warning' | 'Normal' = 'Normal';
  if (latest >= 38.0) status = 'Critical';
  else if (latest >= 37.5) status = 'Warning';

  const criticalCount = temps.filter(t => t >= 38.0).length;
  const warningCount = temps.filter(t => t >= 37.5 && t < 38.0).length;

  return { avg, max, min, latest, status, criticalCount, warningCount };
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 animate-pulse shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto" />
            <div className="h-5 w-16 bg-gray-200 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function TemperatureHistoryPage() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [ridesDetail, setRidesDetail] = useState<Record<number, RideDetail>>({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ── Fetch rides list ──────────────────────────────────────────────────
  const fetchRides = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.getRideHistory(p);
      setRides(res.data);
      setLastPage(res.meta.last_page);
      
      (res.data as unknown as Ride[]).forEach((ride) => {
        fetchRideDetail(ride.id);
      });
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch detail per ride ─────────────────────────────────────────────
  const fetchRideDetail = async (rideId: number) => {
    setLoadingDetails(prev => ({ ...prev, [rideId]: true }));
    try {
      const detail = await api.getRideDetail(rideId);
      setRidesDetail(prev => ({ ...prev, [rideId]: detail }));
    } catch (error) {
      console.error(`Failed to fetch detail for ride ${rideId}:`, error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [rideId]: false }));
    }
  };

  useEffect(() => {
    fetchRides(page);
  }, [page]);

  // ── Navigate to detail ────────────────────────────────────────────────
  const handleRideClick = (rideId: number) => {
    router.push(`/temperature/${rideId}`);
  };

  // ── Calculate totals ──────────────────────────────────────────────────
  const allTemps = Object.values(ridesDetail)
    .filter(detail => detail?.sensor_readings)
    .flatMap(detail => detail!.sensor_readings.map(r => r.body_temperature));

  const avgAllTemp = allTemps.length > 0 
    ? allTemps.reduce((a, b) => a + b, 0) / allTemps.length 
    : 0;

  const maxAllTemp = allTemps.length > 0 ? Math.max(...allTemps) : 0;

  const totalReadings = allTemps.length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* ===== HEADER ===== */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-5 h-5 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900">Temperature History</h1>
            </div>
            <p className="text-sm text-gray-400">Monitor temperature trends across your rides</p>
          </div>

          {/* ===== STATS ===== */}
          {rides.length > 0 && allTemps.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Average</p>
                <p className="text-lg font-bold text-gray-900">{avgAllTemp.toFixed(1)}°C</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Highest</p>
                <p className="text-lg font-bold text-red-500">{maxAllTemp.toFixed(1)}°C</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Readings</p>
                <p className="text-lg font-bold text-gray-900">{totalReadings}</p>
              </div>
            </div>
          )}

          {/* ===== LIST ===== */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : rides.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Thermometer className="w-7 h-7 text-gray-300" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No Temperature Data</h3>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Complete your first ride with temperature sensors.
                  </p>
                  <Link
                    href="/ride"
                    className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Start a Ride
                  </Link>
                </div>
              </div>
            ) : (
              rides.map((ride) => {
                const detail = ridesDetail[ride.id];
                const isLoadingDetail = loadingDetails[ride.id];
                const stats = detail?.sensor_readings 
                  ? getTemperatureStats(detail.sensor_readings)
                  : null;

                const statusColors = {
                  Critical: 'bg-red-50 text-red-600',
                  Warning: 'bg-amber-50 text-amber-600',
                  Normal: 'bg-green-50 text-green-600',
                };

                const statusDot = {
                  Critical: 'bg-red-500',
                  Warning: 'bg-amber-500',
                  Normal: 'bg-green-500',
                };

                return (
                  <div
                    key={ride.id}
                    onClick={() => handleRideClick(ride.id)}
                    className="group bg-white rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm border border-gray-100 hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Date & Status */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex flex-col items-center w-12 shrink-0">
                          <span className="text-lg font-bold text-gray-900">
                            {formatDate(ride.start_time).split(' ')[0]}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {formatDate(ride.start_time).split(' ').slice(1).join(' ')}
                          </span>
                        </div>

                        <div className="h-8 w-px bg-gray-200" />

                        <div className="min-w-0">
                          {isLoadingDetail ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                          ) : stats ? (
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm font-bold" style={{ 
                                color: stats.status === 'Critical' ? '#ef4444' :
                                       stats.status === 'Warning' ? '#f59e0b' :
                                       '#22c55e'
                              }}>
                                {stats.latest.toFixed(1)}°C
                              </span>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[stats.status]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[stats.status]}`} />
                                {stats.status}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>Avg <strong className="text-gray-600">{stats.avg.toFixed(1)}°</strong></span>
                                <span>Max <strong className="text-red-400">{stats.max.toFixed(1)}°</strong></span>
                                <span>Min <strong className="text-blue-400">{stats.min.toFixed(1)}°</strong></span>
                              </div>
                              {(stats.criticalCount > 0 || stats.warningCount > 0) && (
                                <div className="flex items-center gap-1">
                                  {stats.criticalCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      {stats.criticalCount}
                                    </span>
                                  )}
                                  {stats.warningCount > 0 && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      {stats.warningCount}
                                    </span>
                                  )}
                                </div>
                              )}
                              <span className="text-xs text-gray-400">
                                {detail?.sensor_readings?.length || 0} readings
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No data</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {formatTime(ride.start_time)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white group-hover:bg-orange-600 transition-colors">
                          <Thermometer className="w-3.5 h-3.5" />
                          Detail
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ===== PAGINATION ===== */}
          {rides.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <span className="text-sm text-gray-500">
                {page} / {lastPage}
              </span>

              <button
                onClick={() => setPage(Math.min(lastPage, page + 1))}
                disabled={page >= lastPage}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  page >= lastPage
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}