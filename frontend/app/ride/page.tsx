'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRideTracker } from '@/hooks/useRideTracker';
import { RideStats } from '@/components/RideStats';
import { RideControls } from '@/components/RideControls';
import type { RideMode } from '@/types/ride';
import { 
  Activity, 
  Navigation, 
  MapPin, 
  Bike, 
  TrendingUp,
  Award,
  ChevronLeft,
  Target,
  Gauge,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

const RideMap = dynamic(
  () => import('@/components/RideMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-100 md:h-125 bg-linear-to-br from-orange-50 to-orange-100 rounded-2xl animate-pulse flex flex-col items-center justify-center gap-3">
        <MapPin className="w-12 h-12 text-orange-300" />
        <p className="text-orange-400 font-medium">Memuat peta...</p>
      </div>
    ),
  }
);

export default function RidePage() {
  const [mode, setMode] = useState<RideMode>('free');
  const [showModeSelector, setShowModeSelector] = useState(true);
  
  const {
    status,
    stats,
    currentPos,
    trail,
    elapsedTime,
    startRide,
    pauseRide,
    resumeRide,
    finishRide,
    error,
  } = useRideTracker();

  const isIdle = status === 'idle' || status === 'completed';
  const isTracking = status === 'tracking' || status === 'paused';
  const isActive = status !== 'idle' && status !== 'completed';

  const handleStartRide = () => {
    startRide(mode);
    setShowModeSelector(false);
  };

  const handleModeChange = (newMode: RideMode) => {
    setMode(newMode);
  };

  // Format elapsed time for display
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="p-2 hover:bg-orange-50 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-orange-600" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Bike className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Ride Tracker
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Real-time cycling activity tracking
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            {isActive && (
              <div className={`
                px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2
                ${status === 'tracking' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'}
              `}>
                <div className={`w-2 h-2 rounded-full ${
                  status === 'tracking' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`} />
                <span className="hidden sm:inline">
                  {status === 'tracking' ? 'Sedang Bersepeda' : 'Berhenti Sebentar'}
                </span>
                <span className="sm:hidden">
                  {status === 'tracking' ? 'Active' : 'Paused'}
                </span>
              </div>
            )}

            {/* Quick Stats for Active Ride */}
            {isActive && (
              <div className="hidden lg:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-mono font-semibold">{formatElapsedTime(elapsedTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{stats.distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{stats.avgSpeed.toFixed(1)} km/h</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map and Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Banner (when idle) */}
            {isIdle && (
              <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold mb-2">
                  Siap Bersepeda?
                </h2>
                <p className="text-orange-100 text-sm">
                  Pilih mode perjalanan dan mulai tracking aktivitas bersepeda Anda
                </p>
              </div>
            )}

            {/* Map Container */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
              <div className="px-4 py-3 border-b border-orange-100 bg-orange-50/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Peta Real-time</span>
                  <span className="text-xs text-gray-400 hidden sm:inline">
                    (OpenStreetMap)
                  </span>
                </div>
                {currentPos && isActive && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">
                      Live Tracking
                    </span>
                  </div>
                )}
              </div>
              <RideMap
                trail={trail}
                currentPos={currentPos}
                mode={isIdle ? 'preview' : 'tracking'}
                height="500px"
              />
            </div>

            {/* Tips Section (only when idle) */}
            {isIdle && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Tips Keselamatan
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Gunakan helm dan perlengkapan safety</li>
                        <li>• Pastikan GPS menyala dengan baik</li>
                        <li>• Patuhi rambu lalu lintas</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Tips Performa
                      </h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Jaga kecepatan konsisten 20-25 km/jam</li>
                        <li>• Istirahat setiap 1 jam perjalanan</li>
                        <li>• Minum air secara teratur</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Controls and Stats */}
          <div className="space-y-6">
            {/* Mode Selection (only when idle) */}
            {isIdle && showModeSelector && (
              <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-5">
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Pilih Mode Perjalanan
                </h3>
                <div className="space-y-3">
                  {(['free', 'navigation'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModeChange(m)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all text-left
                        ${mode === m 
                          ? 'border-orange-500 bg-orange-50 shadow-md' 
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            mode === m ? 'bg-orange-100' : 'bg-gray-100'
                          }`}>
                            {m === 'free' ? (
                              <Activity className="w-5 h-5 text-orange-600" />
                            ) : (
                              <Navigation className="w-5 h-5 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {m === 'free' ? 'Free Ride' : 'Route Navigation'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {m === 'free' 
                                ? 'Bersepeda bebas tanpa rute yang ditentukan' 
                                : 'Ikuti panduan rute yang sudah ditentukan'}
                            </p>
                          </div>
                        </div>
                        {mode === m && (
                          <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics Panel */}
            {isActive && (
              <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
                <div className="bg-linear-to-r from-orange-500 to-orange-600 px-5 py-3">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Statistik Perjalanan
                  </h3>
                </div>
                <div className="p-5">
                  <RideStats stats={stats} elapsed={elapsedTime} />
                </div>
              </div>
            )}

            {/* Controls Panel */}
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-5">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bike className="w-5 h-5 text-orange-500" />
                Kontrol Perjalanan
              </h3>
              <RideControls
                status={status}
                onStart={handleStartRide}
                onPause={pauseRide}
                onResume={resumeRide}
                onFinish={finishRide}
                isLoading={status === 'starting' || status === 'finishing'}
              />
            </div>

            {/* Quick Stats for Active Ride (Mobile/Tablet) */}
            {isActive && (
              <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-orange-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Ringkasan Cepat
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Durasi</p>
                    <p className="text-lg font-bold text-gray-900">{formatElapsedTime(elapsedTime)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Jarak</p>
                    <p className="text-lg font-bold text-gray-900">{stats.distance.toFixed(1)}<span className="text-xs">km</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Kalori</p>
                    <p className="text-lg font-bold text-gray-900">{stats.calories.toFixed(0)}<span className="text-xs">kkal</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    <div className="w-5 h-5 text-red-600">⚠️</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-medium">Error</p>
                    <p className="text-red-600 text-xs mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}