'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { rideService } from '@/services/rideService';
import type { RideHistoryItem, RideMode } from '@/types/ride';
import { Clock, Navigation, Activity, Flame, MapPin, TrendingUp, Award } from 'lucide-react';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Tanggal tidak valid';
  }
}

function formatNumber(value: number, decimals: number = 1): string {
  if (!value || isNaN(value)) return '0';
  return value.toFixed(decimals);
}

function getModeDisplay(mode: RideMode): { label: string; icon: React.ReactNode } {
  if (mode === 'navigation') {
    return {
      label: 'Navigation',
      icon: <Navigation className="w-3.5 h-3.5" />
    };
  }
  return {
    label: 'Free Ride',
    icon: <Activity className="w-3.5 h-3.5" />
  };
}

export default function RideHistoryPage() {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRides, setTotalRides] = useState(0);

  const fetchHistory = useCallback(async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await rideService.getHistory(pageNum);
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response structure');
      }

      const newRides = response.data;
      const meta = response.meta;

      if (pageNum === 1) {
        setRides(newRides);
      } else {
        setRides(prev => [...prev, ...newRides]);
      }

      if (meta) {
        setTotalRides(meta.total);
        setHasMore(pageNum < meta.last_page);
      } else {
        setHasMore(newRides.length === 10);
      }
    } catch (err) {
      console.error('Failed to fetch ride history:', err);
      setError('Gagal memuat riwayat aktivitas. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHistory(nextPage, true);
    }
  };

  // Calculate total stats
  const totalStats = {
    distance: rides.reduce((sum, ride) => sum + ride.distance, 0),
    duration: rides.reduce((sum, ride) => sum + ride.duration, 0),
    calories: rides.reduce((sum, ride) => sum + ride.calories, 0),
  };

  if (loading && rides.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 animate-pulse">
                <div className="h-4 bg-orange-100 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="text-center">
                      <div className="h-7 bg-orange-100 rounded w-16 mx-auto mb-2"></div>
                      <div className="h-3 bg-orange-50 rounded w-10 mx-auto"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-orange-600">
              Riwayat Aktivitas
            </h1>
            <div className="bg-orange-100 px-3 py-1.5 rounded-full">
              <span className="text-sm font-semibold text-orange-700">
                {totalRides} Aktivitas
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Lihat dan analisis perjalanan bersepeda Anda
          </p>
        </div>

        {/* Total Stats Summary */}
        {rides.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-xs font-medium opacity-90 mb-3">TOTAL KESELURUHAN</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <MapPin className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <p className="text-xl font-bold">{formatNumber(totalStats.distance, 1)}</p>
                <p className="text-xs opacity-90">km</p>
              </div>
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <p className="text-xl font-bold">{formatDuration(totalStats.duration)}</p>
                <p className="text-xs opacity-90">durasi</p>
              </div>
              <div className="text-center">
                <Flame className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <p className="text-xl font-bold">{formatNumber(totalStats.calories, 0)}</p>
                <p className="text-xs opacity-90">kalori</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 text-red-600">⚠️</div>
              </div>
              <div className="flex-1">
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={() => {
                    setPage(1);
                    fetchHistory(1);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && rides.length === 0 && !error && (
          <div className="bg-orange-50 rounded-3xl p-12 text-center border-2 border-dashed border-orange-200">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Award className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum Ada Aktivitas
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Mulai perjalanan bersepeda pertama Anda dan catat statistiknya
            </p>
            <Link
              href="/ride/active"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Activity className="w-4 h-4" />
              Mulai Bersepeda
            </Link>
          </div>
        )}

        {/* Ride List */}
        <div className="space-y-4">
          {rides.map((ride) => {
            const modeDisplay = getModeDisplay(ride.mode);
            
            return (
              <Link
                key={ride.id}
                href={`/ride/${ride.id}`}
                className="block group"
              >
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200">
                  {/* Header with Date and Mode */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(ride.startedAt)}</span>
                    </div>
                    <div className={`
                      flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${ride.mode === 'free' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-orange-100 text-orange-700'}
                    `}>
                      {modeDisplay.icon}
                      <span>{modeDisplay.label}</span>
                    </div>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Distance */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(ride.distance, 1)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Kilometer</p>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <p className="text-xl font-bold text-gray-900">
                          {formatDuration(ride.duration)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Durasi</p>
                    </div>

                    {/* Average Speed */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(ride.avgSpeed, 1)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">km/jam</p>
                    </div>

                    {/* Calories */}
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1.5">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(ride.calories, 0)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">Kalori</p>
                    </div>
                  </div>

                  {/* Additional info for navigation rides */}
                  {ride.mode === 'navigation' && ride.maxSpeed > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-400">
                        Kecepatan maks: {formatNumber(ride.maxSpeed, 1)} km/jam
                      </span>
                      <span className="text-orange-400 group-hover:text-orange-600 transition-colors">
                        Lihat detail →
                      </span>
                    </div>
                  )}

                  {/* Hover indicator for free rides */}
                  {ride.mode === 'free' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                      <span className="text-xs text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        Lihat detail →
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="mt-6 text-center py-4">
            <div className="inline-flex items-center gap-2 text-orange-600">
              <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Memuat lebih banyak...</span>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && !loading && rides.length > 0 && (
          <div className="mt-6">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="
                w-full py-3.5 rounded-xl
                bg-orange-500
                text-white font-semibold
                hover:bg-orange-600
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-md hover:shadow-lg
              "
            >
              {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
            </button>
          </div>
        )}

        {/* End of List */}
        {!hasMore && rides.length > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>Anda telah melihat semua {totalRides} aktivitas</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add this to your global CSS or component CSS
const styles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
`;