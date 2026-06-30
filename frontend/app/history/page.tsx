'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/services/api';
import Sidebar from '@/components/sidebar';

import type { Ride, RideDetail } from '@/types';
import { 
  Clock, 
  MapPin, 
  Flame, 
  Gauge,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Bike,
  Award,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const RideMap = dynamic(() => import('@/components/RideMap'), { ssr: false });

// ========== HELPERS ==========
function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
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

function fmt(v: number | null | undefined, d = 1): string {
  if (!v || isNaN(v)) return '0';
  return v.toFixed(d);
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  completed:  { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  active:     { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Active' },
  paused:     { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused' },
  abandoned:  { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Abandoned' },
};

// ========== COMPONENTS ==========
function StatBadge({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 text-gray-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded-lg" />
          <div className="h-3 w-24 bg-gray-200 rounded-full" />
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-1.5">
            <div className="h-3 w-12 bg-gray-200 rounded-full mx-auto" />
            <div className="h-4 w-16 bg-gray-200 rounded-lg mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function HistoryPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedRideId, setSelectedRideId] = useState<number | null>(null);
  const [rideDetail, setRideDetail] = useState<RideDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHistory = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.getRideHistory(p);
      setRides(res.data);
      setLastPage(res.meta.last_page);
      if (res.data.length > 0 && !selectedRideId) {
        setSelectedRideId(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (rideId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getRideDetail(rideId);
      setRideDetail(detail);
    } catch (error) {
      console.error('Failed to fetch detail:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchHistory(page));
  }, [page]);

  useEffect(() => {
    if (!selectedRideId) return;

    const rideId = selectedRideId;
    Promise.resolve().then(() => {
      if (rideId === selectedRideId) {
        fetchDetail(rideId);
      }
    });
  }, [selectedRideId]);

  // Calculate totals
  const totals = rides.reduce(
    (acc, ride) => ({
      distance: acc.distance + (ride.distance || 0),
      duration: acc.duration + (ride.duration || 0),
      calories: acc.calories + (ride.calories || 0),
      count: acc.count + 1,
    }),
    { distance: 0, duration: 0, calories: 0, count: 0 }
  );

  // ===== SAFE COORDINATES CONVERSION =====
  const getMapCoords = (): [number, number][] => {
    if (!rideDetail) return [];
    
    try {
      // Try to extract coordinates from sensor readings if available
      const rd = rideDetail as unknown as Record<string, unknown>;
      const locations =
        rd.route ??
        rd.locations ??
        rd.coords ??
        [];
      
      if (Array.isArray(locations) && locations.length > 0) {
        // Format: [[lat, lng], [lat, lng]]
        if (Array.isArray(locations[0]) && locations[0].length === 2) {
          return locations as [number, number][];
        }
        
        // Check if first item has lat/lng properties
        if (typeof locations[0] === 'object') {
          // Map items that may have different naming conventions
          return locations.map((item: Record<string, unknown>) => {
            const lat = item['lat'] ?? item['latitude'];
            const lng = item['lng'] ?? item['longitude'];
            return [Number(lat) || 0, Number(lng) || 0] as [number, number];
          });
        }
      }
      return [];
    } catch (error) {
      console.error('Error parsing locations:', error);
      return [];
    }
  };

  const mapCoords = getMapCoords();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 flex flex-col overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="px-8 pt-8 pb-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Activity History</h1>
              <p className="text-sm text-gray-500 mt-1">
                Review and analyze your past cycling sessions
              </p>
            </div>
            {rides.length > 0 && (
              <div className="bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                <span className="text-sm font-bold text-orange-600">
                  {totals.count} rides
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ===== STATS BANNER ===== */}
        {rides.length > 0 && (
          <div className="px-8 pt-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <TrendingUp className="w-4 h-4 opacity-80" />
                    <p className="text-2xl font-black">{totals.count}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Total Rides
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <MapPin className="w-4 h-4 opacity-80" />
                    <p className="text-2xl font-black">{totals.distance.toFixed(1)}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Total KM
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <Clock className="w-4 h-4 opacity-80" />
                    <p className="text-xl font-black">{formatDuration(totals.duration)}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Total Time
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <Flame className="w-4 h-4 opacity-80" />
                    <p className="text-2xl font-black">{totals.calories.toFixed(0)}</p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    Total Kcal
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <div className="flex-1 px-8 py-6 overflow-hidden min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* ===== LEFT: RIDE LIST ===== */}
            <div className="lg:col-span-2 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {loading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </>
                ) : rides.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <Award className="w-12 h-12 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">No Rides Yet</h3>
                      <p className="text-sm text-gray-500 max-w-sm">
                        Complete your first ride to start building your history here.
                      </p>
                      <Link
                        href="/ride"
                        className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                      >
                        Start Your First Ride
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    {rides.map((ride) => {
                      const status = ride.status?.toLowerCase() || 'completed';
                      const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.completed;
                      const isSelected = selectedRideId === ride.id;

                      return (
                        <div
                          key={ride.id}
                          onClick={() => setSelectedRideId(ride.id)}
                          className={`
                            group bg-white border rounded-2xl p-5 
                            transition-all duration-300 cursor-pointer shadow-sm
                            ${isSelected 
                              ? 'border-orange-400 shadow-md shadow-orange-100' 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                <p className="text-sm font-bold text-gray-900">
                                  {formatDate(ride.start_time)}
                                </p>
                                <span className="text-xs text-gray-400">
                                  at {formatTime(ride.start_time)}
                                </span>
                              </div>
                              {ride.helmet?.helmet_name && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
                                  {ride.helmet.helmet_name}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={[
                                'px-3 py-1 rounded-full text-xs font-bold',
                                statusConfig.bg,
                                statusConfig.text,
                              ].join(' ')}>
                                {statusConfig.label}
                              </span>
                              {isSelected && (
                                <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
                            <StatBadge
                              label="Distance"
                              value={`${ride.distance.toFixed(2)} km`}
                              icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
                            />
                            <StatBadge
                              label="Duration"
                              value={formatDuration(ride.duration)}
                              icon={<Clock className="w-3.5 h-3.5 text-gray-400" />}
                            />
                            <StatBadge
                              label="Avg Speed"
                              value={`${ride.avg_speed.toFixed(1)} km/h`}
                              icon={<Gauge className="w-3.5 h-3.5 text-gray-400" />}
                            />
                            <StatBadge
                              label="Calories"
                              value={`${ride.calories.toFixed(0)} kcal`}
                              icon={<Flame className="w-3.5 h-3.5 text-gray-400" />}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Pagination */}
              {rides.length > 0 && (
                <div className="flex items-center justify-center gap-4 pt-4 mt-2 border-t border-gray-200">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className={[
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                      page <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm',
                    ].join(' ')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900">{page}</span>
                    <span className="text-sm text-gray-400">/</span>
                    <span className="text-sm font-bold text-gray-400">{lastPage}</span>
                  </div>

                  <button
                    onClick={() => setPage(Math.min(lastPage, page + 1))}
                    disabled={page >= lastPage}
                    className={[
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                      page >= lastPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm',
                    ].join(' ')}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ===== RIGHT: DETAIL PANEL ===== */}
            <div className="flex flex-col gap-4 overflow-y-auto">
              {/* Map */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm shrink-0">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Route View</span>
                  {rideDetail && (
                    <span className="text-xs text-gray-400">
                      {mapCoords.length} points
                    </span>
                  )}
                </div>
                <div className="h-48">
                  {loadingDetail ? (
                    <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <p className="text-xs text-gray-400">Loading route…</p>
                    </div>
                  ) : mapCoords.length > 0 ? (
                    <RideMap routePoints={mapCoords} />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
                      <MapPin className="w-8 h-8 text-gray-300" />
                      <p className="text-xs text-gray-400 font-medium text-center px-4">
                        {rideDetail ? 'No route data available' : 'Select a ride to view route'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail Stats */}
              {loadingDetail ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse shadow-sm">
                  <div className="h-5 w-32 bg-gray-200 rounded-lg mb-4" />
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="h-3 w-16 bg-gray-200 rounded-full" />
                        <div className="h-5 w-20 bg-gray-200 rounded-lg" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : rideDetail ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bike className="w-4 h-4 text-orange-500" />
                    Ride Details
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Distance', value: `${rideDetail.distance.toFixed(2)} km` },
                      { label: 'Duration', value: formatDuration(rideDetail.duration) },
                      { label: 'Avg Speed', value: `${rideDetail.avg_speed.toFixed(1)} km/h` },
                      { label: 'Max Speed', value: `${rideDetail.max_speed.toFixed(1)} km/h` },
                      { label: 'Calories', value: `${rideDetail.calories.toFixed(0)} kcal` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                          {label}
                        </p>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Impact Events */}
                  {rideDetail.sensor_readings && rideDetail.sensor_readings.filter(r => r.impact_g > 1.8).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <h4 className="text-sm font-bold text-red-600">Impact Events</h4>
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {rideDetail.sensor_readings
                          .filter(r => r.impact_g > 1.8)
                          .slice(0, 5)
                          .map((ev, i) => (
                            <div key={i} className="flex justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs">
                              <span className="text-red-600">{new Date(ev.recorded_at).toLocaleTimeString()}</span>
                              <span className="text-red-700 font-bold">{ev.impact_g.toFixed(2)} g</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm flex-1 flex flex-col items-center justify-center">
                  <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 font-medium">
                    Select a ride to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}