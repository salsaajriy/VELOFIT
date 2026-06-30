'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import type { Helmet } from '@/types';

type HelmetWithStatus = Helmet & {
  battery: number;
  lastSeen: string | null;
  connectionStatus: 'connected' | 'offline';
};

// ── Battery Component (sementara komen) ──────────────────────────────────
function BatteryLevel({ level }: { level: number }) {
  // TODO: Implementasi battery nanti
  // Untuk sementara ini hanya return null atau placeholder
  return null;
}

export default function HelmetStatusCard() {
  const [helmet, setHelmet] = useState<HelmetWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHelmetData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Ambil data helmet dari API
      const helmets = await api.getHelmets();
      
      if (helmets && helmets.length > 0) {
        // Ambil helmet pertama sebagai active helmet
        const activeHelmet = helmets[0];
        
        // TODO: Nanti diganti dengan data real dari API
        const battery = 85; // Sementara hardcode
        
        // TODO: Nanti ambil dari API untuk cek status koneksi
        const lastSeen = new Date().toISOString();
        const isConnected = true; // Sementara selalu true
        
        setHelmet({
          ...activeHelmet,
          battery,
          lastSeen,
          connectionStatus: isConnected ? 'connected' : 'offline'
        });
      } else {
        setHelmet(null);
      }
    } catch (err) {
      console.error('Failed to fetch helmet:', err);
      setError('Failed to load helmet data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Refresh setiap 30 detik
    const interval = setInterval(fetchHelmetData, 30000);
    return () => clearInterval(interval);
  }, [fetchHelmetData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-gray-200 rounded w-28" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
    );
  }

  // Error or no helmet state
  if (error || !helmet) {
    return (
      <Link href="/helmets">
        <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Helmet Status</p>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z" />
                <rect x="4" y="13" width="16" height="3" rx="1.5" />
                <rect x="7" y="16" width="10" height="2.5" rx="1.25" />
              </svg>
            </div>
          </div>
          
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-8 h-8">
                <path d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z" />
                <rect x="4" y="13" width="16" height="3" rx="1.5" />
                <rect x="7" y="16" width="10" height="2.5" rx="1.25" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">No Helmet Connected</p>
            <p className="text-xs text-gray-400 mt-1">Pair your helmet to see status</p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orange-500 group-hover:underline">
              Pair Helmet →
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Data state - hanya tampilkan nama, bluetooth, dan battery
  return (
    <Link href="/helmets">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Helmet
          </p>
          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
              <path d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z" />
              <rect x="4" y="13" width="16" height="3" rx="1.5" />
              <rect x="7" y="16" width="10" height="2.5" rx="1.25" />
            </svg>
          </div>
        </div>

        {/* Nama Helmet */}
        <p className="text-base font-black text-gray-900 truncate">
          {helmet.helmet_name}
        </p>

        {/* Nama Bluetooth */}
        <p className="text-xs font-mono text-gray-400 truncate mt-0.5">
          {helmet.bluetooth_device_name}
        </p>

        {/* Battery - SEMENTARA DIKOMENT */}
        {/* 
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Battery</span>
            <span className="text-sm font-bold text-green-600">{helmet.battery}%</span>
          </div>
        </div>
        */}

        {/* Indicator bahwa ada battery (nanti) */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">Status</span>
          <span className="text-xs font-medium text-green-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Connected
          </span>
        </div>

        {/* Action */}
        <div className="mt-2 text-[10px] text-orange-500 font-medium group-hover:underline text-right">
          Manage →
        </div>
      </div>
    </Link>
  );
}