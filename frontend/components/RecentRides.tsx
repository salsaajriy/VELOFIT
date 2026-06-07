'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { rideService } from '@/services/rideService';
import type { RideHistoryItem } from '@/types/ride';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  completed:  { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed'  },
  active:     { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Active'     },
  paused:     { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused'     },
  abandoned:  { bg: 'bg-red-100',    text: 'text-red-600',    label: 'Abandoned'  },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return '—'; }
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${seconds}s`;
}

export default function RecentRides() {
  const [rides, setRides] = useState<RideHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRides = async () => {
      try {
        // Ambil halaman pertama dengan limit kecil
        const response = await rideService.getHistory(1);
        // Ambil 5 data terbaru saja
        setRides(response.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch recent rides:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentRides();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
          <div className="text-sm font-semibold text-blue-500">View All</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-560px">
            <thead>
              <tr className="border-b border-gray-50">
                {['DATE', 'ROUTE', 'DISTANCE', 'DURATION', 'STATUS'].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-bold text-gray-400 tracking-widest uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                  </td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                  <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
          <Link href="/history" className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
            View All
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l-7 7 7 7M5 12h14" />
            </svg>
            <p className="text-sm font-medium">No rides yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete your first ride to see history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
        <Link href="/history" className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
          View All
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-560px">
          <thead>
            <tr className="border-b border-gray-50">
              {['DATE', 'ROUTE', 'DISTANCE', 'DURATION', 'STATUS'].map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-bold text-gray-400 tracking-widest uppercase">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => {
              const statusInfo = STATUS_CONFIG[ride.status?.toLowerCase()] ?? STATUS_CONFIG.completed;
              
              return (
                <tr key={ride.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{formatDate(ride.started_at)}</p>
                    <p className="text-xs text-gray-400">{formatTime(ride.started_at)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {ride.distance ? `${ride.distance.toFixed(1)} km` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDuration(ride.duration)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}