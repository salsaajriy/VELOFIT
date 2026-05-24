'use client';
 
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { rideService } from '@/services/rideService';
import type { RideDetail } from '@/types/ride';
 
const RideMap = dynamic(() => import('@/components/RideMap'), { ssr: false });
 
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}
 
export default function RideDetailPage() {
  const params  = useParams();
  const rideId  = parseInt(params.id as string);
  const [ride, setRide]     = useState<RideDetail | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    rideService.getRideDetail(rideId)
      .then(setRide)
      .finally(() => setLoading(false));
  }, [rideId]);
 
  if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Memuat...</div>;
  if (!ride)   return <div className="p-8 text-center text-red-400">Ride tidak ditemukan.</div>;
 
  const trail = ride.locations.map((l): [number, number] => [l.lat, l.lng]);
  const durationMin = Math.floor(ride.duration / 60);
 
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Detail Aktivitas</h1>
 
      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-md">
        <RideMap trail={trail} mode="history" height="350px" />
      </div>
 
      {/* Alerts */}
      {ride.alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="font-semibold text-red-700 mb-2">⚠️ Alert Selama Ride</p>
          {ride.alerts.map((a) => (
            <p key={a.id} className="text-sm text-red-600">• {a.message}</p>
          ))}
        </div>
      )}
 
      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <p className="font-semibold text-gray-700 mb-2">📊 Statistik</p>
        <StatRow label="Jarak"            value={`${ride.distance.toFixed(2)} km`} />
        <StatRow label="Durasi"           value={`${durationMin} menit`} />
        <StatRow label="Kecepatan Rata-rata" value={`${ride.avg_speed.toFixed(1)} km/h`} />
        <StatRow label="Kecepatan Maks."  value={`${ride.max_speed.toFixed(1)} km/h`} />
        <StatRow label="Kalori Terbakar"  value={`${ride.calories.toFixed(0)} kkal`} />
        <StatRow label="Mode"             value={ride.mode === 'free' ? 'Free Ride' : 'Navigasi'} />
      </div>
    </div>
  );
}
