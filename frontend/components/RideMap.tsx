'use client';

import { useEffect, useRef, memo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

const startIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#22c55e" stroke="white" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">S</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const endIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="10" fill="#ef4444" stroke="white" stroke-width="2"/>
      <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">F</text>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const liveIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// ── Sub-komponen: Auto-pan ke posisi terkini ──────────────────
function MapAutoCenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const prevPos = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!position) return;
    const [lat, lng] = position;
    if (prevPos.current) {
      const [pLat, pLng] = prevPos.current;
      if (Math.abs(lat - pLat) < 0.00001 && Math.abs(lng - pLng) < 0.00001) return;
    }
    map.panTo([lat, lng], { animate: true, duration: 0.5 });
    prevPos.current = position;
  }, [position, map]);

  return null;
}

// ── Sub-komponen: FitBounds untuk history ────────────────────
function MapFitBounds({ trail }: { trail: Array<[number, number]> }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!trail || !trail.length || fitted.current) return;
    const bounds = L.latLngBounds(trail.map(([lat, lng]) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
    fitted.current = true;
  }, [trail, map]);

  return null;
}

interface RideMapProps {
  trail?:         Array<[number, number]>;  // Make optional with default
  currentPos?:    { lat: number; lng: number } | null;
  routeCoords?:   Array<[number, number]>;
  coords?:        Array<[number, number]>;  // Alternative prop name
  mode:           'tracking' | 'history' | 'route' | 'preview';
  center?:        [number, number];
  height?:        string;
  className?:     string;
}

const RideMap = memo(function RideMap({
  trail = [],          
  currentPos,
  routeCoords,
  coords,             
  mode,
  center = [1.1301, 104.0529], 
  height = '400px',
  className = '',
}: RideMapProps) {
  const effectiveTrail = trail && trail.length > 0 ? trail : (coords || []);
  
  const livePos: [number, number] | null = currentPos
    ? [currentPos.lat, currentPos.lng]
    : null;

  // Safe access with checks
  const startPoint = effectiveTrail && effectiveTrail.length > 0 ? effectiveTrail[0] : null;
  const endPoint = effectiveTrail && effectiveTrail.length > 1 ? effectiveTrail[effectiveTrail.length - 1] : null;

  // Determine if we should show start/end markers
  const showStartMarker = mode !== 'tracking' && startPoint;
  const showEndMarker = mode === 'history' && endPoint;
  const showLiveMarker = mode === 'tracking' && livePos;

  return (
    <MapContainer
      center={livePos ?? center}
      zoom={16}
      style={{ height, width: '100%', borderRadius: '12px' }}
      attributionControl={false}
      className={className}
    >
      {/* Base tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Trail yang sudah ditempuh */}
      {effectiveTrail && effectiveTrail.length > 1 && (
        <Polyline
          positions={effectiveTrail}
          color="#3b82f6"
          weight={4}
          opacity={0.85}
          smoothFactor={1.5}
        />
      )}

      {/* Rute navigasi (jika mode navigation) */}
      {routeCoords && routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          color="#9ca3af"
          weight={4}
          opacity={0.5}
          dashArray="8, 8"
        />
      )}

      {/* Marker titik awal */}
      {showStartMarker && <Marker position={startPoint!} icon={startIcon} />}

      {/* Marker titik akhir (hanya saat history) */}
      {showEndMarker && <Marker position={endPoint!} icon={endIcon} />}

      {/* Live marker posisi sekarang */}
      {showLiveMarker && <Marker position={livePos!} icon={liveIcon} />}

      {/* Auto behaviors */}
      {mode === 'tracking' && <MapAutoCenter position={livePos} />}
      {mode === 'history' && effectiveTrail && effectiveTrail.length > 0 && (
        <MapFitBounds trail={effectiveTrail} />
      )}
    </MapContainer>
  );
});

export default RideMap;