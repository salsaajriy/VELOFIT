'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/sidebar';

const rideHistory = [
  { date: 'Oct 24, 2025', time: '07:30 AM', route: 'Coastal Highway Path', distance: '24.8 km', duration: '1h 12m', status: 'Completed' },
  { date: 'Oct 22, 2025', time: '06:15 PM', route: 'Downtown Loop', distance: '12.2 km', duration: '45m', status: 'Completed' },
  { date: 'Oct 20, 2025', time: '08:00 AM', route: 'Mountain Trail A', distance: '5.4 km', duration: '22m', status: 'Incompleted' },
];

export default function DashboardPage() {
  const [rideActive, setRideActive] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Desktop offset + mobile top-bar offset */}
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-black text-gray-900 my-6">Dashboard</h1>

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-52 bg-gray-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80')`,
            }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.95) 45%, transparent 80%)' }} />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-lg">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">System Ready</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight mb-5">
              Prepare for your<br />morning ride.
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setRideActive(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Start Ride
              </button>
              <button
                onClick={() => setRideActive(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                End Ride
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6">
                  <path d="M3 3v18h18" strokeLinecap="round" />
                  <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
              label: 'Total Distance',
              value: '0 km',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-6 h-6">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" strokeLinecap="round" />
                </svg>
              ),
              label: 'Duration',
              value: '0m',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              ),
              label: 'Calories',
              value: '0 kcal',
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <rect x="2" y="7" width="16" height="11" rx="2" stroke="#f59e0b" strokeWidth="2" />
                  <path d="M18 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3" stroke="#f59e0b" strokeWidth="2" />
                  <rect x="4" y="10" width="8" height="5" rx="1" fill="#f59e0b" />
                </svg>
              ),
              label: 'Helmet Battery',
              value: '65%',
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-3">{stat.icon}</div>
              <p className="text-xs text-gray-400 font-medium mb-1">{stat.label}</p>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Body Temperature */}
          <div className="bg-white rounded-2xl p-5 border-2 border-red-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-5 h-5">
                  <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-red-500">Body Temperature</p>
                <p className="text-xs text-gray-400">Threshold exceeded (37.5°C)</p>
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-4 mb-3">37°C</p>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient from-red-400 to-red-600" style={{ width: '72%' }} />
            </div>
          </div>

          {/* SOS Status */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="#22c55e" className="w-6 h-6">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-gray-800">SOS Status</p>
                <p className="text-xs text-gray-400">Ready for triggers</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-black text-gray-800 tracking-wide">INACTIVE / SAFE</span>
            </div>
          </div>

          {/* Weekly Target */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm font-bold text-gray-800 mb-0.5">Weekly Target</p>
            <p className="text-xs text-gray-400 mb-4">Progress towards 150km goal</p>
            <div className="flex justify-center mb-3">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="#3b82f6" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38 * 0.83} ${2 * Math.PI * 38}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-gray-900">83%</span>
                  <span className="text-xs text-gray-400">REACHED</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>124.5 KM DONE</span>
              <span>25.5 KM LEFT</span>
            </div>
          </div>
        </div>

        {/* Recent Ride History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-black text-gray-900">Recent Ride History</h3>
            <Link href="/history" className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-560px">
              <thead>
                <tr className="border-b border-gray-50">
                  {['DATE', 'ROUTE', 'DISTANCE', 'DURATION', 'STATUS'].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-bold text-gray-400 tracking-widest uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rideHistory.map((ride, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-800">{ride.date}</p>
                      <p className="text-xs text-gray-400">{ride.time}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ride.route}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{ride.distance}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ride.duration}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        ride.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}