'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { rideService } from '@/services/rideService';
import type { RideHistoryItem } from '@/types/ride';
import { Calendar, Clock, MapPin, Gauge, Flame, ChevronRight } from 'lucide-react';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  completed:  { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed'  },
  active:     { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Active'     },
  paused:     { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused'     },
  abandoned:  { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Abandoned'  },
};


function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch { return '—'; }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function RecentRides() {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRides = async () => {
      try {
        const response = await rideService.getHistory(1);
        setRides(response.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch recent rides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentRides();
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
            <div className="h-5 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded" />
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center gap-6">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <div className="h-3 w-3 bg-gray-200 rounded" />
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
          <Link href="/history" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            View All
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l-7 7 7 7M5 12h14" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900">No Rides Yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete your first ride to see history</p>
          </div>
        </div>
      </div>
    );
  }

  // Data State
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
          <span className="bg-orange-50 px-2.5 py-0.5 rounded-full text-xs font-bold text-orange-600">
            {rides.length}
          </span>
          <span className="text-xs text-gray-400 font-medium">(Latest 5 rides)</span>
        </div>
        <Link 
          href="/history" 
          className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Ride List */}
      <div className="divide-y divide-gray-100">
        {rides.map((ride) => {
          const statusInfo = STATUS_CONFIG[ride.status?.toLowerCase()] ?? STATUS_CONFIG.completed;
          
          return (
            <Link
              key={ride.id}
              href={`/history/${ride.id}`}
              className="block px-6 py-4 hover:bg-gray-50/80 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: Date & Stats */}
                <div className="flex-1 min-w-0">

                  {/* Stats - Grid untuk lebih rapi */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Distance */}
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Distance
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {ride.distance?.toFixed(2) || '0'} km
                        </p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Duration
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatDuration(ride.duration)}
                        </p>
                      </div>
                    </div>

                    {/* Avg Speed */}
                    <div className="flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Avg Speed
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {ride.avg_speed?.toFixed(1) || '0'} km/h
                        </p>
                      </div>
                    </div>

                    {/* Calories */}
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Calories
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {ride.calories?.toFixed(0) || '0'} kcal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={[
                    'px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap',
                    statusInfo.bg,
                    statusInfo.text,
                  ].join(' ')}>
                    {statusInfo.label}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}