'use client';

import { useState } from 'react';
import { useRide } from '@/hooks/useRide';
import { useBLE } from '@/hooks/useBLE';
import { useSensorStore } from '@/store/sensorStore';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  Bike, 
  Thermometer, 
  Gauge, 
  MapPin, 
  Activity, 
  AlertTriangle,
  Bluetooth,
  BluetoothOff,
  Play,
  Square,
  Clock,
  TrendingUp
} from 'lucide-react';

const RideMap = dynamic(() => import('@/components/RideMap'), { ssr: false });

// ========== STAT CARD COMPONENT ==========
function StatCard({ 
  label, 
  value, 
  icon, 
  color = 'orange',
  subtext 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
  color?: 'orange' | 'red' | 'green' | 'blue' | 'gray';
  subtext?: string;
}) {
  const colorClasses = {
    orange: 'bg-orange-50 border-orange-200/50',
    red: 'bg-red-50 border-red-200/50',
    green: 'bg-green-50 border-green-200/50',
    blue: 'bg-blue-50 border-blue-200/50',
    gray: 'bg-gray-50 border-gray-200/50',
  };

  const iconColors = {
    orange: 'text-orange-500',
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    gray: 'text-gray-500',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={iconColors[color]}>{icon}</div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-xl font-black text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  );
}

// ========== MAIN COMPONENT ==========
export default function RidePage() {
  const { startRide, finishRide, isRideActive, activeRide, totalDistance, currentSpeed } = useRide();
const {
  connect,
  isConnected,
  activeHelmet,
  cancelAlert,
} = useBLE();
  const sensorData = useSensorStore((s) => s.sensorData);
  const routePoints = useSensorStore((s) => s.routePoints);

  const sosActive = sensorData?.g !== undefined && sensorData.g > 1;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canStart = !isRideActive;

const handleStart = async () => {
  setError('');
  setLoading(true);

  try {
    console.log('isConnected:', isConnected);
    console.log('activeHelmet:', activeHelmet);

    if (!isConnected) {
      await connect();
    }

    await startRide();
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to start ride.'
    );
  } finally {
    setLoading(false);
  }
};
const handleFinish = async () => {
  setLoading(true);

  try {
    await finishRide();
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-gray-200/60 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-600">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                    <Bike className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Live Ride</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {isRideActive ? 'Currently tracking your ride' : 'Ready to start cycling'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <Bluetooth className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-bold text-green-600">Connected</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                  <BluetoothOff className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400">Disconnected</span>
                </div>
              )}
              {/* {activeHelmet && (
                <span className="text-xs text-gray-400 font-medium">
                  {activeHelmet.helmet_name}
                </span>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* ===== SENSOR STATS GRID ===== */}
        {sensorData ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <StatCard
                label="Body Temp"
                value={`${sensorData.body.toFixed(1)}°C`}
                icon={<Thermometer className="w-4 h-4" />}
                color={sensorData.body > 37.5 ? 'red' : 'orange'}
                subtext={sensorData.body > 37.5 ? '⚠️ Elevated' : 'Normal'}
              />
              <StatCard
                label="Room Temp"
                value={`${sensorData.room.toFixed(1)}°C`}
                icon={<Thermometer className="w-4 h-4" />}
                color="gray"
              />
              <StatCard
                label="Impact"
                value={`${sensorData.g.toFixed(2)} g`}
                icon={<Activity className="w-4 h-4" />}
                color={sensorData.g > 1.8 ? 'red' : 'green'}
                subtext={sensorData.g > 1.8 ? '⚠️ High impact' : 'Normal'}
              />
              <StatCard
                label="GPS"
                value={sensorData.gpsOk ? 'Fixed' : 'No Fix'}
                icon={<MapPin className="w-4 h-4" />}
                color={sensorData.gpsOk ? 'green' : 'gray'}
                subtext={sensorData.gpsOk ? 'Signal locked' : 'Searching...'}
              />
              <StatCard
                label="Speed"
                value={`${currentSpeed.toFixed(1)} km/h`}
                icon={<Gauge className="w-4 h-4" />}
                color={currentSpeed > 25 ? 'red' : currentSpeed > 10 ? 'orange' : 'green'}
              />
              <StatCard
                label="Distance"
                value={`${totalDistance.toFixed(2)} km`}
                icon={<TrendingUp className="w-4 h-4" />}
                color="orange"
              />
            </div>

            {/* ===== SOS ALERT BANNER ===== */}
{sosActive && (
  <div className="border-2 border-red-400 bg-red-50 rounded-2xl p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <AlertTriangle className="w-6 h-6 text-red-500" />
      <span className="font-bold text-red-600">
        🚨 SOS ALERT ACTIVE — Emergency detected!
      </span>
    </div>

    <button
      onClick={async () => {
        try {
          await cancelAlert();
        } catch (err) {
          console.error(err);
        }
      }}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition"
    >
      Cancel Alert
    </button>
  </div>
)}
          </>
        ) : (
          // No sensor data yet
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-6">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Bluetooth className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to Ride</h3>
              <p className="text-sm text-gray-400">
                Start a ride to connect your helmet and begin tracking.
              </p>
            </div>
          </div>
        )}

        {/* ===== MAP ===== */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-700">Live Map</span>
              {isRideActive && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  ● Live
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {routePoints.length} points recorded
            </span>
          </div>
          <div className="h-72">
            {routePoints.length > 0 ? (
              <RideMap routePoints={routePoints} />
            ) : (
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
                <MapPin className="w-10 h-10 text-gray-200" />
                <p className="text-sm font-medium text-gray-400">
                  {isRideActive ? 'Tracking in progress...' : 'Start a ride to see your route'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ===== CONTROLS ===== */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {!isRideActive ? (
              <button
                onClick={handleStart}
                disabled={!canStart || loading}
                className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl 
                           transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Ride
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl
                           transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Finishing...
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    Finish Ride
                  </>
                )}
              </button>
            )}

            {/* Ride Status */}
            {isRideActive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-xs font-bold text-green-600">Ride Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>

          {/* Helmet Info
          {activeHelmet && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Helmet: <span className="font-bold text-gray-900">{activeHelmet.helmet_name}</span>
                </span>
              </div>
              {activeHelmet.battery !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        activeHelmet.battery > 50 ? 'bg-green-500' : 
                        activeHelmet.battery > 20 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${activeHelmet.battery}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${
                    activeHelmet.battery > 50 ? 'text-green-600' : 
                    activeHelmet.battery > 20 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {activeHelmet.battery}%
                  </span>
                </div>
              )}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}