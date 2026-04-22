'use client';

// app/history/page.tsx
import { useState } from 'react';
import Sidebar from '@/components/sidebar';

// ── Types ──────────────────────────────────────────────────────────────────

type RideStatus = 'Completed' | 'Incompleted';

interface Ride {
  id: string;
  name: string;
  date: string;
  distance: string;
  duration: string;
  status: RideStatus;
  avgSpeed: number;
  maxTemp: number;
  /** Polyline coordinates untuk peta (lat, lng) */
  routeCoords: [number, number][];
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const rides: Ride[] = [
  {
    id: 'SR-942023',
    name: 'Morning Ride',
    date: 'Oct 24, 2025 • 08:30 AM',
    distance: '42.5 km',
    duration: '1h 45m',
    status: 'Completed',
    avgSpeed: 28.4,
    maxTemp: 24,
    routeCoords: [
      [48.8584, 2.2945],
      [48.8606, 2.3376],
      [48.8566, 2.3522],
    ],
  },
  {
    id: 'SR-942024',
    name: 'Mountain Ride',
    date: 'Oct 22, 2025 • 02:15 PM',
    distance: '12.8 km',
    duration: '45m',
    status: 'Incompleted',
    avgSpeed: 17.1,
    maxTemp: 31,
    routeCoords: [
      [48.8744, 2.3526],
      [48.8691, 2.3417],
    ],
  },
  {
    id: 'SR-942025',
    name: 'City Commute Loop',
    date: 'Oct 21, 2025 • 05:45 PM',
    distance: '8.2 km',
    duration: '28m',
    status: 'Completed',
    avgSpeed: 17.6,
    maxTemp: 28,
    routeCoords: [
      [48.8534, 2.3488],
      [48.8461, 2.3573],
      [48.8432, 2.3483],
    ],
  },
  {
    id: 'SR-942026',
    name: 'Lake View Ride',
    date: 'Oct 19, 2025 • 07:10 AM',
    distance: '25.0 km',
    duration: '55m',
    status: 'Completed',
    avgSpeed: 27.3,
    maxTemp: 22,
    routeCoords: [
      [48.8656, 2.3212],
      [48.8721, 2.3344],
      [48.8783, 2.3199],
    ],
  },
  {
    id: 'SR-942027',
    name: 'Evening Sprint',
    date: 'Oct 18, 2025 • 06:00 PM',
    distance: '15.3 km',
    duration: '35m',
    status: 'Completed',
    avgSpeed: 26.2,
    maxTemp: 26,
    routeCoords: [
      [48.8501, 2.3401],
      [48.8429, 2.3598],
    ],
  },
  {
    id: 'SR-942028',
    name: 'Riverside Path',
    date: 'Oct 17, 2025 • 07:30 AM',
    distance: '18.7 km',
    duration: '42m',
    status: 'Completed',
    avgSpeed: 26.7,
    maxTemp: 23,
    routeCoords: [
      [48.8611, 2.3501],
      [48.8699, 2.3298],
    ],
  },
  {
    id: 'SR-942029',
    name: 'Sunday Tour',
    date: 'Oct 15, 2025 • 09:00 AM',
    distance: '33.1 km',
    duration: '1h 20m',
    status: 'Completed',
    avgSpeed: 24.8,
    maxTemp: 20,
    routeCoords: [
      [48.8732, 2.295],
      [48.8659, 2.3411],
      [48.8521, 2.3501],
    ],
  },
  {
    id: 'SR-942030',
    name: 'Quick Lap',
    date: 'Oct 13, 2025 • 06:45 AM',
    distance: '6.4 km',
    duration: '18m',
    status: 'Incompleted',
    avgSpeed: 21.3,
    maxTemp: 29,
    routeCoords: [
      [48.8544, 2.3472],
      [48.8499, 2.3511],
    ],
  },
];

// ── Status badge config ────────────────────────────────────────────────────

const statusConfig: Record<RideStatus, { bg: string; text: string }> = {
  Completed: { bg: 'bg-green-100', text: 'text-green-600' },
  Incompleted: { bg: 'bg-red-100', text: 'text-red-500' },
};

// ── Static Map via OpenStreetMap tiles (no API key needed) ─────────────────

function StaticMap() {
  /**
   * We render a decorative map using an iframe from OpenStreetMap.
   * For a real project, replace this with Leaflet or Google Maps + actual route polyline.
   */
  return (
    <iframe
      title="Route Map"
      src="https://www.openstreetmap.org/export/embed.html?bbox=2.27%2C48.84%2C2.42%2C48.90&layer=mapnik"
      className="w-full h-full border-0"
      loading="lazy"
    />
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | RideStatus>('All');
  const [timeFilter, setTimeFilter] = useState('Last 30 Days');
  const [selectedRide, setSelectedRide] = useState<Ride>(rides[0]);
  const [mapExpanded, setMapExpanded] = useState(false);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = rides.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.date.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 flex flex-col overflow-hidden">
        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-black text-gray-900">Activity History</h1>
          <p className="text-sm text-gray-400 mt-1">
            Review and analyze your past cycling sessions
          </p>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────── */}
        <div className="px-8 pb-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by route name or date"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'All' | RideStatus)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-100 shadow-sm cursor-pointer"
          >
            <option value="All">Status ↓</option>
            <option value="Completed">Completed</option>
            <option value="Incompleted">Incompleted</option>
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-100 shadow-sm cursor-pointer"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 3 Months</option>
            <option>All Time</option>
          </select>
        </div>

        {/* ── Content Area ────────────────────────────────────────────── */}
        <div className="flex flex-1 gap-5 px-8 pb-8 overflow-hidden min-h-0">

          {/* ── Ride List ───────────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-w-0">

            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3 border-b border-gray-100">
              {['DATE & ROUTE', 'DISTANCE', 'DURATION', 'STATUS', ''].map((h) => (
                <span key={h} className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mb-3">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                  </svg>
                  <p className="text-sm font-semibold">No rides found</p>
                </div>
              ) : (
                filtered.map((ride) => {
                  const isSelected = selectedRide.id === ride.id;
                  const s = statusConfig[ride.status];
                  return (
                    <button
                      key={ride.id}
                      onClick={() => setSelectedRide(ride)}
                      className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4 border-b border-gray-50 text-left transition-colors ${
                        isSelected ? 'bg-amber-50/60' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Date & Route */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Active indicator */}
                        <div
                          className={`w-0.5 self-stretch rounded-full shrink-0 mt-0.5 ${
                            isSelected ? 'bg-amber-500' : 'bg-transparent'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-tight">{ride.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{ride.date}</p>
                        </div>
                      </div>

                      {/* Distance */}
                      <span className="text-sm font-semibold text-gray-700">{ride.distance}</span>

                      {/* Duration */}
                      <span className="text-sm text-gray-600">{ride.duration}</span>

                      {/* Status */}
                      <span
                        className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}
                      >
                        {ride.status}
                      </span>

                      {/* Chevron */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-4 h-4 text-gray-300"
                      >
                        <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Route Detail Panel ──────────────────────────────────── */}
          <div className="w-72 shrink-0 flex flex-col gap-4">

            {/* Map Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Map header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-black text-gray-800">Route View</span>
                <button
                  onClick={() => setMapExpanded(!mapExpanded)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Expand map"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Map iframe */}
              <div className={`relative transition-all duration-300 ${mapExpanded ? 'h-64' : 'h-44'}`}>
                <StaticMap />
              </div>
            </div>

            {/* Ride Detail Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {/* Ride name + status icon */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-xl font-black text-gray-900 leading-tight">
                  {selectedRide.name}
                </h3>
                {selectedRide.status === 'Completed' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-6 h-6 shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-4">Ride ID: #{selectedRide.id}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Avg Speed */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Avg Speed
                    </span>
                  </div>
                  <p className="text-xl font-black text-gray-900">
                    {selectedRide.avgSpeed}{' '}
                    <span className="text-xs font-semibold text-gray-400">km/h</span>
                  </p>
                </div>

                {/* Max Temp */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Max Temp
                    </span>
                  </div>
                  <p className="text-xl font-black text-gray-900">
                    {selectedRide.maxTemp}
                    <span className="text-xs font-semibold text-gray-400">°C</span>
                  </p>
                </div>

                {/* Distance */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-3.5 h-3.5">
                      <path d="M3 3v18h18" strokeLinecap="round" />
                      <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Distance
                    </span>
                  </div>
                  <p className="text-xl font-black text-gray-900">{selectedRide.distance}</p>
                </div>

                {/* Duration */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="w-3.5 h-3.5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      Duration
                    </span>
                  </div>
                  <p className="text-xl font-black text-gray-900">{selectedRide.duration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}