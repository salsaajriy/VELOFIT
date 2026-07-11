'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Thermometer } from 'lucide-react';

type SensorReading = {
  body_temperature: number;
  recorded_at: string;
};

type RideDetail = {
  id: number;
  sensor_readings: SensorReading[];
};

export default function TemperatureCard() {
  const [latestRide, setLatestRide] = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestTemperature = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            const res = await api.getRideHistory(1);

            if (res.data.length > 0) {
                const detail = await api.getRideDetail(res.data[0].id);
                setLatestRide(detail as RideDetail);
            }

        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }

    fetchLatestTemperature();

    // Refresh setiap 30 detik
    const interval = setInterval(fetchLatestTemperature, 30000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded mt-1" />
          </div>
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded mt-4 mb-3" />
        <div className="w-full h-2 bg-gray-200 rounded-full" />
      </div>
    );
  }

  // No data state
  if (!latestRide || !latestRide.sensor_readings || latestRide.sensor_readings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Body Temperature</p>
            <p className="text-xs text-gray-400">No data available</p>
          </div>
        </div>
        <p className="text-2xl font-black text-gray-300 mt-4 mb-3">--°C</p>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gray-200" style={{ width: '0%' }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">Complete a ride to start tracking</p>
      </div>
    );
  }

  // Data state
  const readings = latestRide.sensor_readings;
  const latestTemp = readings[readings.length - 1].body_temperature;
  const avgTemp = readings.reduce((acc, r) => acc + r.body_temperature, 0) / readings.length;
  const maxTemp = Math.max(...readings.map(r => r.body_temperature));
  const minTemp = Math.min(...readings.map(r => r.body_temperature));
  
  const isCritical = latestTemp >= 38.0;
  const isWarning = latestTemp >= 37.5;
  const status = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Normal';
  const statusColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';
  const statusBg = isCritical ? 'bg-red-50' : isWarning ? 'bg-amber-50' : 'bg-green-50';
  const statusText = isCritical ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-green-500';
  const borderColor = isCritical ? 'border-red-200' : isWarning ? 'border-amber-200' : 'border-green-200';
  
  // Progress bar (35°C - 40°C range)
  const progress = ((latestTemp - 35) / (40 - 35)) * 100;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const recordedTime = new Date(readings[readings.length - 1].recorded_at);
  const timeStr = recordedTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`bg-white rounded-2xl p-5 border-2 shadow-sm transition-all hover:shadow-md ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${statusBg} flex items-center justify-center shrink-0`}>
            <Thermometer className={`w-5 h-5 ${statusText}`} />
          </div>
          <div>
            <p className={`text-sm font-bold ${statusText}`}>Body Temperature</p>
            <p className="text-xs text-gray-400">
              {isCritical ? '⚠️ Critical - Immediate attention' : 
               isWarning ? '⚠️ Above normal range' : 
               'Normal range'}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusBg} ${statusText}`}>
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-black" style={{ color: statusColor }}>
            {avgTemp.toFixed(1)}°C
          </p>
          <p className="text-xs text-gray-400">Avg • {timeStr}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Latest <span className="font-bold text-gray-600">{latestTemp.toFixed(1)}°</span></span>
            <span className="text-gray-400">Max <span className="font-bold text-red-400">{maxTemp.toFixed(1)}°</span></span>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>35°C</span>
          <span>Normal</span>
          <span>37.5°</span>
          <span>Critical</span>
          <span>40°C</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${clampedProgress}%`,
              background: `linear-gradient(90deg, #22c55e, #f59e0b, #ef4444)`
            }}
          />
          {/* Threshold marker */}
          <div 
            className="absolute top-0 w-0.5 h-2 bg-red-500"
            style={{ left: '50%' }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-gray-400">
          <span>{readings.length} readings</span>
          <span className="text-red-400">Threshold 37.5°C</span>
        </div>
      </div>

        <button 
            onClick={() => window.location.href = '/temperature'}
            className="mt-3 pt-3 border-t border-gray-100 flex justify-end cursor-pointer">
            <span className="text-[10px] text-orange-500 font-medium group-hover:underline">
                View Full History →
            </span>
        </button>
    </div>
  );
}