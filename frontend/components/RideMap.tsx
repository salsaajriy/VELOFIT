'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom marker icons ────────────────────────────────────────────────────

const startIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;
    border-radius:50%;
    background:#22c55e;
    border:2.5px solid white;
    box-shadow:0 0 0 2px #22c55e44;
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const endIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:14px;height:14px;
    border-radius:50%;
    background:#ef4444;
    border:2.5px solid white;
    box-shadow:0 0 0 2px #ef444444;
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

// ── Live tracking dot ──────────────────────────────────────────────────────

const liveIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:12px;height:12px;
    border-radius:50%;
    background:#f59e0b;
    border:2px solid white;
    box-shadow:0 0 0 4px #f59e0b33;
    animation:pulse 1.5s infinite;
  "></div>
  <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 4px #f59e0b33}50%{box-shadow:0 0 0 8px #f59e0b11}}</style>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

// ── Props ──────────────────────────────────────────────────────────────────

interface RideMapProps {
  /** Array of [lat, lng] tuples */
  coords: [number, number][];
  /** Whether this is a live tracking map (shows live dot at last point) */
  live?: boolean;
  /** Tailwind / CSS class for the container div */
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RideMap({ coords, live = false, className = 'h-44' }: RideMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const polylineRef  = useRef<L.Polyline | null>(null);
  const startMarker  = useRef<L.Marker | null>(null);
  const endMarker    = useRef<L.Marker | null>(null);
  const liveMarker   = useRef<L.Marker | null>(null);

  // ── Initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Sync coords whenever they change ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!coords || coords.length === 0) {
      // Show a default world view if no coords yet
      map.setView([0, 0], 2);
      return;
    }

    // ── Draw / update polyline ─────────────────────────────────────────────
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(coords);
    } else {
      polylineRef.current = L.polyline(coords, {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.9,
        lineJoin: 'round',
      }).addTo(map);
    }

    // ── Start marker ───────────────────────────────────────────────────────
    if (!startMarker.current) {
      startMarker.current = L.marker(coords[0], { icon: startIcon }).addTo(map);
    } else {
      startMarker.current.setLatLng(coords[0]);
    }

    // ── End / live marker ──────────────────────────────────────────────────
    const last = coords[coords.length - 1];

    if (live) {
      // Remove static end marker if it exists
      endMarker.current?.remove();
      endMarker.current = null;

      if (!liveMarker.current) {
        liveMarker.current = L.marker(last, { icon: liveIcon }).addTo(map);
      } else {
        liveMarker.current.setLatLng(last);
      }
    } else {
      liveMarker.current?.remove();
      liveMarker.current = null;

      if (coords.length > 1) {
        if (!endMarker.current) {
          endMarker.current = L.marker(last, { icon: endIcon }).addTo(map);
        } else {
          endMarker.current.setLatLng(last);
        }
      }
    }

    // ── Fit bounds ─────────────────────────────────────────────────────────
    if (coords.length === 1) {
      map.setView(coords[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(coords), { padding: [24, 24], maxZoom: 17 });
    }
  }, [coords, live]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ background: '#e5e7eb' }}
    />
  );
}