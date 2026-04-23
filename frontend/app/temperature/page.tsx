'use client';

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

const tempData = [
  { time: '07:00 AM', value: 36.1 },
  { time: '07:30 AM', value: 36.3 },
  { time: '08:00 AM', value: 36.7 },
  { time: '08:30 AM', value: 36.9 },
  { time: '09:00 AM', value: 38.2 },
  { time: '09:30 AM', value: 37.1 },
  { time: '10:00 AM', value: 36.5 },
];

type StatusSeverity = 'Critical' | 'Warning' | 'Normal';

const eventLogs: { date: string; time: string; temp: string; tempColor: string; duration: string; status: StatusSeverity }[] = [
  { date: 'Oct 26, 2025', time: '14:12 PM', temp: '38.7°C', tempColor: '#ef4444', duration: '12 min', status: 'Critical' },
  { date: 'Oct 26, 2025', time: '08:55 AM', temp: '37.6°C', tempColor: '#f59e0b', duration: '4 min', status: 'Warning' },
  { date: 'Oct 25, 2025', time: '09:30 AM', temp: '36.7°C', tempColor: '#22c55e', duration: '—', status: 'Normal' },
  { date: 'Oct 25, 2025', time: '07:45 AM', temp: '36.5°C', tempColor: '#22c55e', duration: '—', status: 'Normal' },
];

const statusConfig: Record<StatusSeverity, { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
  Warning: { bg: 'bg-amber-100', text: 'text-amber-600', dot: 'bg-amber-400' },
  Normal: { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
};

// ── SVG Chart ──────────────────────────────────────────────────────────────
type TempDataPoint = { time: string; value: number };

function TempChart({ data }: { data: TempDataPoint[] }) {
  const W = 900;
  const H = 220;
  const padL = 30;
  const padR = 40;
  const padT = 20;
  const padB = 40;

  const minVal = 35.5;
  const maxVal = 39.5;

  const xStep = (W - padL - padR) / (data.length - 1);

  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + ((maxVal - v) / (maxVal - minVal)) * (H - padT - padB);

  const threshold = 37.5;
  const thresholdY = toY(threshold);

  // build polyline points
  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');

  // area fill path
  const areaPath =
    `M ${toX(0)},${toY(data[0].value)} ` +
    data.slice(1).map((d, i) => `L ${toX(i + 1)},${toY(d.value)}`).join(' ') +
    ` L ${toX(data.length - 1)},${H - padB} L ${toX(0)},${H - padB} Z`;

  // y-axis labels
  const yLabels = [39, 38, 37, 36];

  // peak index
  const peakIdx = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((val) => (
        <line
          key={val}
          x1={padL}
          x2={W - padR}
          y1={toY(val)}
          y2={toY(val)}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Threshold dashed line */}
      <line
        x1={padL}
        x2={W - padR}
        y1={thresholdY}
        y2={thresholdY}
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeDasharray="6 4"
        opacity="0.7"
      />
      <text x={W - padR + 4} y={thresholdY + 4} fontSize="10" fill="#ef4444" fontWeight="700">
        37.5°C Threshold
      </text>

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="#f97316"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Peak dot */}
      <circle
        cx={toX(peakIdx)}
        cy={toY(data[peakIdx].value)}
        r="5"
        fill="#ef4444"
        stroke="white"
        strokeWidth="2"
      />

      {/* Y-axis labels */}
      {yLabels.map((val) => (
        <text key={val} x={padL - 6} y={toY(val) + 4} fontSize="10" fill="#9ca3af" textAnchor="end">
          {val}
        </text>
      ))}
      <text x={W - padR + 4} y={H - padB + 4} fontSize="10" fill="#9ca3af">°C</text>

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={toX(i)}
          y={H - padB + 16}
          fontSize="10"
          fill="#9ca3af"
          textAnchor="middle"
        >
          {d.time}
        </text>
      ))}
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function BodyTemperaturePage() {
  const [severity, setSeverity] = useState('All Severities');
  const [timeRange, setTimeRange] = useState('Last 24 Hours');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Desktop offset + mobile top-bar offset */}
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between my-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Body Temperature History</h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time health telemetry and historical worker safety data.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
            </svg>
            Export Report
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Current Status */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Status</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black" style={{ color: '#22c55e' }}>
              Normal <span className="text-lg">36.6°C</span>
            </p>
            <p className="text-xs text-gray-400 mt-1.5">Last updated: 2 mins ago</p>
          </div>

          {/* Last High Reading */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last High Reading</span>
            </div>
            <p className="text-2xl font-black text-red-500">
              38.2°C <span className="text-base font-bold text-red-400">Critical</span>
            </p>
            <p className="text-xs text-gray-400 mt-1.5">Detected: Oct 24, 14:12 PM</p>
          </div>

          {/* 7-Day Avg */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">7-Day Avg</span>
            </div>
            <p className="text-2xl font-black text-gray-900">36.8°C</p>
            <p className="text-xs text-gray-400 mt-1.5">Within safe operating range</p>
          </div>
        </div>

        {/* Temperature Trends Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-gray-900">Temperature Trends</h2>
              <p className="text-xs text-gray-400 mt-0.5">Dotted line indicates 37.6°C threshold</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-gray-500">Core Temp</span>
            </div>
          </div>
          <div className="h-52 w-full">
            <TempChart data={tempData} />
          </div>
        </div>

        {/* Detailed Event Logs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header row */}
          <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-gray-100 gap-3">
            <h2 className="text-base font-black text-gray-900">Detailed Event Logs</h2>
            <div className="flex items-center gap-2">
              {/* Severity filter */}
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
              >
                <option>All Severities</option>
                <option>Critical</option>
                <option>Warning</option>
                <option>Normal</option>
              </select>

              {/* Time range filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
              >
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>

              {/* Filter icon */}
              <button className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="21" y1="6" x2="3" y2="6" strokeLinecap="round" />
                  <line x1="17" y1="12" x2="7" y2="12" strokeLinecap="round" />
                  <line x1="13" y1="18" x2="11" y2="18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-560px">
              <thead>
                <tr className="border-b border-gray-50">
                  {['DATE', 'TIME', 'TEMP (°C)', 'HIGH TEMP DURATION', 'STATUS'].map((col) => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-bold text-gray-400 tracking-widest uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventLogs.map((log, i) => {
                  const s = statusConfig[log.status];
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{log.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.time}</td>
                      <td className="px-6 py-4 text-sm font-bold" style={{ color: log.tempColor }}>
                        {log.temp}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Showing 1 to 4 of 48 entries</span>
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}