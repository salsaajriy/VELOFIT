'use client';
 
import type { RideStats } from '@/types/ride';
 
function StatCard({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  );
}
 
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
 
export function RideStats({ stats, elapsed }: { stats: RideStats; elapsed: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-2">
      <StatCard label="Duration"    value={formatTime(elapsed)} />
      <StatCard label="Distance"    value={stats.distance.toFixed(2)} unit="km" />
      <StatCard label="Average Speed" value={stats.avgSpeed.toFixed(1)} unit="km/h" />
      <StatCard label="Max Speed" value={stats.maxSpeed.toFixed(1)} unit="km/h" />
      <StatCard label="Calories"   value={stats.calories.toFixed(0)} unit="kkal" />
    </div>
  );
}
