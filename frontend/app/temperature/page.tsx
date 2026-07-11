'use client';

import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/services/api';
import { 
  Thermometer,
  AlertTriangle,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────
type Ride = {
  id: number;
  distance: number;
  duration: number | null;
  start_time: string;
  status: string;
  helmet?: {
    helmet_name: string;
  };
};

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

// ── Helpers ──────────────────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function getTemperatureStats(readings: SensorReading[]): {
  avg: number;
  max: number;
  min: number;
  latest: number;
  status: 'Critical' | 'Warning' | 'Normal';
  criticalCount: number;
  warningCount: number;
} {
  if (!readings || readings.length === 0) {
    return {
      avg: 0,
      max: 0,
      min: 0,
      latest: 0,
      status: 'Normal',
      criticalCount: 0,
      warningCount: 0,
    };
  }

  const temps = readings.map(r => r.body_temperature);
  const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
  const max = Math.max(...temps);
  const min = Math.min(...temps);
  const latest = temps[temps.length - 1];

  let status: 'Critical' | 'Warning' | 'Normal' = 'Normal';
  if (latest >= 38.0) status = 'Critical';
  else if (latest >= 37.5) status = 'Warning';

  const criticalCount = temps.filter(t => t >= 38.0).length;
  const warningCount = temps.filter(t => t >= 37.5 && t < 38.0).length;

  return { avg, max, min, latest, status, criticalCount, warningCount };
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-bold text-gray-900">
          {payload[0].value.toFixed(1)}°C
        </p>
      </div>
    );
  }
  return null;
}

function TempChart({ data }: { data: TempDataPoint[] }) {
  // Format data for recharts
  const chartData = data.map(d => ({
    time: d.time,
    temperature: d.value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData}>
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          interval="preserveStartEnd"
          // Only show limited ticks
          tickCount={10}
        />
        <YAxis 
          domain={[35.5, 39.5]}
          tick={{ fontSize: 10, fill: '#9ca3af' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          ticks={[36, 37, 38, 39]}
          tickFormatter={(value) => `${value}°`}
        />
        <Tooltip active={false} />
        {/* <Tooltip content={<CustomTooltip />} /> */}
        
        {/* Threshold line */}
        <ReferenceLine 
          y={37.5} 
          stroke="#ef4444" 
          strokeDasharray="6 4"
          label={{ 
            value: 'Threshold 37.5°C', 
            position: 'right',
            fill: '#ef4444',
            fontSize: 10,
            fontWeight: 'bold'
          }}
        />
        
        {/* Area */}
        <Area 
          type="monotone" 
          dataKey="temperature" 
          fill="#fef3c7" 
          fillOpacity={0.8}
          stroke="none"
        />
        
        {/* Line */}
        <Line 
          type="monotone" 
          dataKey="temperature" 
          stroke="#f97316" 
          strokeWidth={2.5}
          dot={{ 
            r: 3, 
            fill: '#f97316',
            stroke: 'white',
            strokeWidth: 1.5
          }}
          activeDot={{ 
            r: 6, 
            fill: '#ef4444',
            stroke: 'white',
            strokeWidth: 2
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 animate-pulse shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-12 bg-gray-200 rounded mx-auto" />
            <div className="h-5 w-16 bg-gray-200 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Detail Accordion Component ────────────────────────────────────────────
function RideDetailAccordion({ rideId }: { rideId: number }) {
  const [loading, setLoading] = useState(true);
  const [rideData, setRideData] = useState<RideDetail | null>(null);
  const [severity, setSeverity] = useState('All Severities');
  const [timeRange, setTimeRange] = useState('Last 24 Hours');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await api.getRideDetail(rideId);
        setRideData(response as unknown as RideDetail);
      } catch (error) {
        console.error('Failed to fetch ride detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rideId]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading temperature data...</span>
        </div>
      </div>
    );
  }

  if (!rideData || !rideData.sensor_readings || rideData.sensor_readings.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-sm text-gray-400">No temperature data available for this ride</p>
      </div>
    );
  }

  const readings = rideData.sensor_readings;
  
  // Build chart data
  const chartData: TempDataPoint[] = readings.map((reading) => {
    const date = new Date(reading.recorded_at);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return {
      time: `${hours}:${minutes}`,
      value: reading.body_temperature,
    };
  });

  // Build event logs
  const eventLogs: EventLog[] = readings.map((reading) => {
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

    return {
      date: dateStr,
      time: timeStr,
      temp: tempStr,
      tempColor,
      duration: '—',
      status,
    };
  });

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {/* Temperature Trends Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-gray-200 gap-3">
          <h2 className="text-base font-black text-gray-900">Detailed Event Logs</h2>
          <div className="flex items-center gap-2">
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

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 cursor-pointer"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-560px">
            <thead>
              <tr className="border-b border-gray-100">
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
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function TemperatureHistoryPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [ridesDetail, setRidesDetail] = useState<Record<number, RideDetail>>({});
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [expandedRide, setExpandedRide] = useState<number | null>(null);

  // ── Fetch rides list ──────────────────────────────────────────────────
  const fetchRides = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.getRideHistory(p);
      setRides(res.data);
      setLastPage(res.meta.last_page);
      
      (res.data as unknown as Ride[]).forEach((ride) => {
        fetchRideDetail(ride.id);
      });
    } catch (error) {
      console.error('Failed to fetch rides:', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch detail per ride ─────────────────────────────────────────────
  const fetchRideDetail = async (rideId: number) => {
    setLoadingDetails(prev => ({ ...prev, [rideId]: true }));
    try {
      const detail = await api.getRideDetail(rideId);
      // Cast to local RideDetail type to satisfy state typing
      setRidesDetail(prev => ({ ...prev, [rideId]: detail as unknown as RideDetail }));
    } catch (error) {
      console.error(`Failed to fetch detail for ride ${rideId}:`, error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [rideId]: false }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRides(page);
    }, 0);
    return () => clearTimeout(timer);
  }, [page]);

  // ── Toggle expand ────────────────────────────────────────────────────
  const toggleExpand = (rideId: number) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };

  // ── Calculate totals ──────────────────────────────────────────────────
  const allTemps = Object.values(ridesDetail)
    .filter(detail => detail?.sensor_readings)
    .flatMap(detail => detail!.sensor_readings.map(r => r.body_temperature));

  const avgAllTemp = allTemps.length > 0 
    ? allTemps.reduce((a, b) => a + b, 0) / allTemps.length 
    : 0;

  const latestAllTemp = allTemps.length > 0 ? allTemps[allTemps.length - 1] : 0;

  const totalReadings = allTemps.length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 mx-4 px-4 py-4 lg:px-6 lg:py-6 pt-16 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          {/* ===== HEADER ===== */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Body Temperature History</h1>
              <p className="text-sm text-gray-400 mt-1">
                Real-time health telemetry and historical worker safety data.
              </p>
            </div>
          </div>

          {/* ===== STATS ===== */}
          {rides.length > 0 && allTemps.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Average</p>
                <p className="text-lg font-bold text-gray-900">{avgAllTemp.toFixed(1)}°C</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Latest</p>
                <p className="text-lg font-bold text-green-500">{latestAllTemp.toFixed(1)}°C</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Readings</p>
                <p className="text-lg font-bold text-gray-900">{totalReadings}</p>
              </div>
            </div>
          )}

          {/* ===== LIST ===== */}
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : rides.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Thermometer className="w-7 h-7 text-gray-300" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No Temperature Data</h3>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Complete your first ride with temperature sensors.
                  </p>
                  <Link
                    href="/ride"
                    className="mt-4 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    Start a Ride
                  </Link>
                </div>
              </div>
            ) : (
              rides.map((ride) => {
                const detail = ridesDetail[ride.id];
                const isLoadingDetail = loadingDetails[ride.id];
                const stats = detail?.sensor_readings 
                  ? getTemperatureStats(detail.sensor_readings)
                  : null;
                const isExpanded = expandedRide === ride.id;

                const statusColors = {
                  Critical: 'bg-red-50 text-red-600',
                  Warning: 'bg-amber-50 text-amber-600',
                  Normal: 'bg-green-50 text-green-600',
                };

                const statusDot = {
                  Critical: 'bg-red-500',
                  Warning: 'bg-amber-500',
                  Normal: 'bg-green-500',
                };

                return (
                  <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-orange-300 transition-all duration-200">
                    {/* Clickable Header */}
                    <div
                      onClick={() => toggleExpand(ride.id)}
                      className="p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between">
                        {/* Left: Date & Status */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex flex-col items-center w-12 shrink-0">
                            <span className="text-lg font-bold text-gray-900">
                              {formatDate(ride.start_time).split(' ')[0]}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {formatDate(ride.start_time).split(' ').slice(1).join(' ')}
                            </span>
                          </div>

                          <div className="h-8 w-px bg-gray-200" />

                          <div className="min-w-0">
                            {isLoadingDetail ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                              </div>
                            ) : stats ? (
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-bold text-green-600">
                                  {stats.avg.toFixed(1)}°C
                                </span>
                                
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[stats.status]}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[stats.status]}`} />
                                  {stats.status}
                                </span>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>Latest <strong className="text-gray-600">{stats.latest.toFixed(1)}°</strong></span>
                                  <span>Max <strong className="text-red-400">{stats.max.toFixed(1)}°</strong></span>
                                  <span>Min <strong className="text-blue-400">{stats.min.toFixed(1)}°</strong></span>
                                </div>
                                
                                {(stats.criticalCount > 0 || stats.warningCount > 0) && (
                                  <div className="flex items-center gap-1">
                                    {stats.criticalCount > 0 && (
                                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        {stats.criticalCount}
                                      </span>
                                    )}
                                    {stats.warningCount > 0 && (
                                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold rounded">
                                        <AlertTriangle className="w-2.5 h-2.5" />
                                        {stats.warningCount}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <span className="text-xs text-gray-400">
                                  {detail?.sensor_readings?.length || 0} readings
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No data</span>
                            )}
                          </div>
                        </div>

                        {/* Right: Action */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            {formatTime(ride.start_time)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white">
                              <Thermometer className="w-3.5 h-3.5" />
                              {isExpanded ? 'Hide' : 'Detail'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <RideDetailAccordion rideId={ride.id} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ===== PAGINATION ===== */}
          {rides.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <span className="text-sm text-gray-500">
                {page} / {lastPage}
              </span>

              <button
                onClick={() => setPage(Math.min(lastPage, page + 1))}
                disabled={page >= lastPage}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  page >= lastPage
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
                ].join(' ')}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}