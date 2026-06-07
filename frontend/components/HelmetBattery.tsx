'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { helmetService, type Helmet, getConnectionStatus } from '@/services/helmetService';

function BatteryLevel({ level }: { level: number }) {
  const getBatteryColor = () => {
    if (level >= 60) return '#22c55e';
    if (level >= 30) return '#f59e0b';
    return '#ef4444';
  };

  const getBatteryTextColor = () => {
    if (level >= 60) return 'text-green-600';
    if (level >= 30) return 'text-amber-600';
    return 'text-red-600';
  };

  const segments = 4;
  const color = getBatteryColor();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = ((i + 1) / segments) * 100;
          const filled = level >= threshold - (100 / segments / 2);
          return (
            <div
              key={i}
              className="w-4 h-6 rounded-sm transition-all"
              style={{ 
                backgroundColor: filled ? color : '#e5e7eb',
                opacity: filled ? 1 : 0.5
              }}
            />
          );
        })}
        <div className="w-1 h-3 rounded-r-sm ml-0.5" style={{ backgroundColor: '#9ca3af' }} />
      </div>
      <span className={`text-xl font-black ${getBatteryTextColor()}`}>
        {level}%
      </span>
    </div>
  );
}

function ConnectionBadge({ lastSeen }: { lastSeen: string | null }) {
  const status = getConnectionStatus(lastSeen);
  const isConnected = status === 'connected';
  
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${
        isConnected
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          : 'bg-gray-100 text-gray-400 border border-gray-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
      {isConnected ? 'Online' : 'Offline'}
    </span>
  );
}

export default function HelmetBatteryCard() {
  const [activeHelmet, setActiveHelmet] = useState<Helmet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveHelmet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const helmet = await helmetService.getActiveHelmetId();
      setActiveHelmet(helmet);
    } catch (err) {
      console.error('Failed to fetch helmet:', err);
      setError('Failed to load helmet data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveHelmet();
    const interval = setInterval(fetchActiveHelmet, 10000);
    return () => clearInterval(interval);
  }, [fetchActiveHelmet]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 bg-gray-200 rounded w-28" />
            <div className="h-8 w-8 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
          <div className="h-12 bg-gray-100 rounded-xl mb-3" />
          <div className="flex justify-between">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !activeHelmet) {
    return (
      <Link href="/helmets">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Helmet Status</p>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z" />
                <rect x="4" y="13" width="16" height="3" rx="1.5" />
                <rect x="7" y="16" width="10" height="2.5" rx="1.25" />
              </svg>
            </div>
          </div>
          
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-8 h-8">
                <path d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z" />
                <rect x="4" y="13" width="16" height="3" rx="1.5" />
                <rect x="7" y="16" width="10" height="2.5" rx="1.25" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">No Helmet Connected</p>
            <p className="text-xs text-gray-400 mt-1">Pair your helmet to see battery status</p>
            <div className="mt-4 text-xs font-medium text-orange-500 group-hover:underline">
              Pair Helmet →
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/helmets">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 font-medium">Helmet Battery</p>
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <rect x="2" y="7" width="16" height="11" rx="2" stroke="#f59e0b" strokeWidth="2" />
            <path d="M18 10h3a1 0 0 1 1 1v3a1 0 0 1-1 1h-3" stroke="#f59e0b" strokeWidth="2" />
            <rect x="4" y="10" width="8" height="5" rx="1" fill="#f59e0b" />
          </svg>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">
                {activeHelmet.deviceName}
              </p>
              <p className="text-[10px] text-gray-400 font-mono truncate">
                {activeHelmet.deviceId}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <ConnectionBadge lastSeen={activeHelmet.lastSeen} />
          </div>
          <BatteryLevel level={activeHelmet.battery} />
        </div>
      </div>
    </Link>
  );
}