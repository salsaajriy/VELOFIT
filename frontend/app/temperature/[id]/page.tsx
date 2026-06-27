'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import { api } from '@/services/api';

// ── Types ──────────────────────────────────────────────────────────────────
type SensorReading = {
  body_temperature: number;
  room_temperature: number;
  impact_g: number;
  alert_state: number;
  recorded_at: string;
};

type RideDetail = {
  id: number;
  helmet: Record<string, unknown>;
  distance: number;
  duration: number;
  calories: number;
  route: Record<string, unknown>;
  sensor_readings: SensorReading[];
};

type TempDataPoint = {
  time: string;
  value: number;
};

type StatusSeverity = 'Critical' | 'Warning' | 'Normal';

type EventLog = {
  date: string;
  time: string;
  temp: string;
  tempColor: string;
  duration: string;
  status: StatusSeverity;
};

const statusConfig: Record<StatusSeverity, { bg: string; text: string; dot: string }> = {
  Critical: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
  Warning: { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-400' },
  Normal: { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
};

// ── SVG Chart ──────────────────────────────────────────────────────────────
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

// ── Empty State Component ──────────────────────────────────────────────
function EmptyState({ icon, title, description, action }: { 
  icon: string; 
  title: string; 
  description: string; 
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="text-7xl mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md text-center">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── Loading State Component ─────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-orange-100 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="mt-6 text-gray-500 font-medium">Loading temperature data...</p>
      <p className="text-xs text-gray-400 mt-1">Please wait while we fetch the latest readings</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function BodyTemperaturePage() {
  const params = useParams();
  const rideId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rideData, setRideData] = useState<RideDetail | null>(null);
  const [severity, setSeverity] = useState('All Severities');
  const [timeRange, setTimeRange] = useState('Last 24 Hours');

  // ── Fetch real data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      setError('Ride ID is missing');
      return;
    }

    const fetchRideDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getRideDetail(Number(rideId));
        // api.getRideDetail returns the RideDetail directly
        // cast to local RideDetail to satisfy incompatible imported types
        setRideData(response as unknown as RideDetail);
      } catch (err) {
        console.error('Failed to fetch ride detail:', err);
        setError('Failed to load temperature data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRideDetail();
  }, [rideId]);

  // ── Transform sensor readings for chart ──────────────────────────────
  const buildChartData = (readings: SensorReading[]): TempDataPoint[] => {
    if (!readings || readings.length === 0) return [];

    return readings.map((reading) => {
      const date = new Date(reading.recorded_at);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return {
        time: `${hours}:${minutes}`,
        value: reading.body_temperature,
      };
    });
  };

  // ── Build event logs from sensor readings ─────────────────────────────
  const buildEventLogs = (readings: SensorReading[]): EventLog[] => {
    if (!readings || readings.length === 0) return [];

    return readings.map((reading) => {
      const date = new Date(reading.recorded_at);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const temp = reading.body_temperature;
      const tempStr = `${temp.toFixed(1)}°C`;
      let status: StatusSeverity;
      let tempColor: string;

      if (temp >= 38.0) {
        status = 'Critical';
        tempColor = '#ef4444';
      } else if (temp >= 37.5) {
        status = 'Warning';
        tempColor = '#f59e0b';
      } else {
        status = 'Normal';
        tempColor = '#22c55e';
      }

      const duration = '—';

      return {
        date: dateStr,
        time: timeStr,
        temp: tempStr,
        tempColor,
        duration,
        status,
      };
    });
  };

  // ── Compute stats ──────────────────────────────────────────────────────
  const getCurrentStatus = (readings: SensorReading[]): { status: StatusSeverity; temp: string; color: string } => {
    if (!readings || readings.length === 0) {
      return { status: 'Normal', temp: '—', color: '#22c55e' };
    }

    const latest = readings[readings.length - 1];
    const temp = latest.body_temperature;
    const tempStr = `${temp.toFixed(1)}°C`;

    let status: StatusSeverity;
    let color: string;

    if (temp >= 38.0) {
      status = 'Critical';
      color = '#ef4444';
    } else if (temp >= 37.5) {
      status = 'Warning';
      color = '#f59e0b';
    } else {
      status = 'Normal';
      color = '#22c55e';
    }

    return { status, temp: tempStr, color };
  };

  const getLastHighReading = (readings: SensorReading[]): { temp: string; date: string; status: StatusSeverity } | null => {
    if (!readings || readings.length === 0) return null;

    let highest = readings[0];
    for (const reading of readings) {
      if (reading.body_temperature > highest.body_temperature) {
        highest = reading;
      }
    }

    const temp = highest.body_temperature;
    let status: StatusSeverity;
    if (temp >= 38.0) status = 'Critical';
    else if (temp >= 37.5) status = 'Warning';
    else status = 'Normal';

    const date = new Date(highest.recorded_at);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      temp: `${temp.toFixed(1)}°C`,
      date: `${dateStr}, ${timeStr}`,
      status,
    };
  };

  const getAverageTemp = (readings: SensorReading[]): string => {
    if (!readings || readings.length === 0) return '—';
    const sum = readings.reduce((acc, r) => acc + r.body_temperature, 0);
    const avg = sum / readings.length;
    return `${avg.toFixed(1)}°C`;
  };

  // ── Prepare data ───────────────────────────────────────────────────────
  const sensorReadings = rideData?.sensor_readings || [];
  const chartData = buildChartData(sensorReadings);
  const eventLogs = buildEventLogs(sensorReadings);
  const currentStatus = getCurrentStatus(sensorReadings);
  const lastHigh = getLastHighReading(sensorReadings);
  const avgTemp = getAverageTemp(sensorReadings);

  // ── Render dengan Sidebar wrapper ─────────────────────────────────────
  const renderWithSidebar = (content: React.ReactNode) => (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">
        {/* Header selalu ditampilkan */}
        <div className="flex items-start justify-between my-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Body Temperature History</h1>
            <p className="text-sm text-gray-400 mt-1">
              Real-time health telemetry and historical worker safety data.
            </p>
          </div>
        </div>
        {content}
      </main>
    </div>
  );

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return renderWithSidebar(<LoadingState />);
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error) {
    const isPermissionError = error.includes('permission') || error.includes('403');
    const isNotFoundError = error.includes('not found') || error.includes('404');
    
    return renderWithSidebar(
      <EmptyState
        icon={isPermissionError ? '🔒' : isNotFoundError ? '🔍' : '⚠️'}
        title={isPermissionError ? 'Access Denied' : isNotFoundError ? 'Ride Not Found' : 'Something Went Wrong'}
        description={error}
        action={{ label: 'Go Back', onClick: () => window.history.back() }}
      />
    );
  }

  // ── Empty state (no sensor data) ──────────────────────────────────────
  if (!rideData || sensorReadings.length === 0) {
    return renderWithSidebar(
      <EmptyState
        icon="📊"
        title="No Temperature Data Available"
        description="Sensor readings haven't been recorded for this ride yet. Once data becomes available, it will appear here automatically."
        action={{ label: 'Refresh', onClick: () => window.location.reload() }}
      />
    );
  }

  // ── Data state ──────────────────────────────────────────────────────────
  return renderWithSidebar(
    <>
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Current Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Status</span>
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor:
                  currentStatus.status === 'Critical' ? '#ef4444' :
                  currentStatus.status === 'Warning' ? '#f59e0b' :
                  '#22c55e'
              }}
            />
          </div>
          <p className="text-2xl font-black" style={{ color: currentStatus.color }}>
            {currentStatus.status} <span className="text-lg">{currentStatus.temp}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Last updated: {sensorReadings.length > 0 ? new Date(sensorReadings[sensorReadings.length - 1].recorded_at).toLocaleTimeString() : 'N/A'}
          </p>
        </div>

        {/* Last High Reading */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last High Reading</span>
          </div>
          {lastHigh ? (
            <>
              <p className="text-2xl font-black text-red-500">
                {lastHigh.temp} <span className="text-base font-bold text-red-400">{lastHigh.status}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1.5">Detected: {lastHigh.date}</p>
            </>
          ) : (
            <p className="text-gray-400 text-sm">No high readings recorded</p>
          )}
        </div>

        {/* Ride Average */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ride Average</span>
          </div>
          <p className="text-2xl font-black text-gray-900">{avgTemp}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            Based on {sensorReadings.length} reading{sensorReadings.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Temperature Trends Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-gray-900">Temperature Trends</h2>
            <p className="text-xs text-gray-400 mt-0.5">Dotted line indicates 37.5°C threshold</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold text-gray-500">Core Temp</span>
          </div>
        </div>
        <div className="h-52 w-full">
          <TempChart data={chartData} />
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
              className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
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
              className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
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
          <span className="text-xs text-gray-400">
            Showing 1 to {eventLogs.length} of {eventLogs.length} entr{eventLogs.length > 1 ? 'ies' : 'y'}
          </span>
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
    </>
  );
}