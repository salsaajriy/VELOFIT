'use client';

// app/helmets/page.tsx

import { useState } from 'react';
import Sidebar from '@/components/sidebar';

// ── Types ──────────────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'offline';

interface Helmet {
  id: string;
  deviceId: string;
  name: string;
  battery: number;
  connection: ConnectionStatus;
  isActive: boolean;
}

// ── Icons ──────────────────────────────────────────────────────────────────

function HelmetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <rect width="64" height="64" rx="12" fill="#f1f5f9" />
      {/* Skull decorative icon */}
      <circle cx="32" cy="28" r="11" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="27.5" cy="27" r="2.5" fill="#94a3b8" />
      <circle cx="36.5" cy="27" r="2.5" fill="#94a3b8" />
      <path d="M27 34h10M29 37h6" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 30c0-6.075 4.925-11 11-11s11 4.925 11 11v5H21v-5z" fill="#e2e8f0" />
    </svg>
  );
}

function BluetoothIcon({ connected }: { connected: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
      <path
        d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"
        stroke={connected ? '#3b82f6' : '#94a3b8'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!connected && (
        <line x1="3" y1="3" x2="21" y2="21" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  );
}

// ── Battery bar ────────────────────────────────────────────────────────────

function BatteryBar({ level }: { level: number }) {
  const color =
    level >= 70 ? '#22c55e' : level >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center gap-2">
      {/* Battery icon */}
      <svg viewBox="0 0 24 12" className="w-5 h-3" fill="none">
        <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke={color} strokeWidth="1" />
        <rect x="21" y="3.5" width="2.5" height="5" rx="1" fill={color} />
        <rect
          x="1.5"
          y="1.5"
          width={(level / 100) * 18}
          height="9"
          rx="1.5"
          fill={color}
        />
      </svg>
      <span className="text-base font-black" style={{ color }}>
        {level}%
      </span>
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ── Pair Modal ─────────────────────────────────────────────────────────────

function PairModal({ onClose, onPair }: { onClose: () => void; onPair: (name: string) => void }) {
  const [name, setName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setFound(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gray-900">Pair New Device</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Device Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Carbon Helmet"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Scan area */}
          <div
            className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
              found
                ? 'border-green-300 bg-green-50'
                : scanning
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {scanning ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm font-semibold text-blue-600">Scanning for devices...</p>
              </div>
            ) : found ? (
              <div className="flex flex-col items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-8 h-8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-semibold text-green-600">Device found! Ready to pair.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="w-8 h-8">
                  <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm text-gray-400">Click scan to discover nearby helmets</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!found ? (
              <button
                onClick={handleScan}
                disabled={scanning}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                {scanning ? 'Scanning...' : 'Scan for Devices'}
              </button>
            ) : (
              <button
                onClick={() => onPair(name || 'New Helmet')}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                Pair Device
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const initialHelmets: Helmet[] = [
  // {
  //   id: '1',
  //   deviceId: 'SH-99210-XC',
  //   name: 'Pro Rider - Carbon Elite',
  //   battery: 92,
  //   connection: 'connected',
  //   isActive: true,
  // },
  {
    id: '2',
    deviceId: 'SH-77182-AP',
    name: 'Adventure Pro',
    battery: 58,
    connection: 'offline',
    isActive: false,
  },
];

let nextId = 3;

export default function ManageHelmetsPage() {
  const [helmets, setHelmets] = useState<Helmet[]>(initialHelmets);
  const [showPairModal, setShowPairModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Set Active ──────────────────────────────────────────────────────────
  const handleSetActive = (id: string, value: boolean) => {
    setHelmets((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, isActive: value } : { ...h, isActive: value ? false : h.isActive }
      )
    );
  };

  // ── Rename ──────────────────────────────────────────────────────────────
  const startEdit = (h: Helmet) => {
    setEditingId(h.id);
    setEditName(h.name);
  };

  const commitEdit = (id: string) => {
    if (editName.trim()) {
      setHelmets((prev) =>
        prev.map((h) => (h.id === id ? { ...h, name: editName.trim() } : h))
      );
    }
    setEditingId(null);
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    setHelmets((prev) => prev.filter((h) => h.id !== id));
    setDeleteConfirmId(null);
  };

  // ── Pair New ────────────────────────────────────────────────────────────
  const handlePair = (name: string) => {
    const newHelmet: Helmet = {
      id: String(nextId++),
      deviceId: `SH-${Math.floor(10000 + Math.random() * 90000)}-NW`,
      name,
      battery: Math.floor(60 + Math.random() * 40),
      connection: 'connected',
      isActive: false,
    };
    setHelmets((prev) => [...prev, newHelmet]);
    setShowPairModal(false);
  };

  const activeHelmet = helmets.find((h) => h.isActive);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="my-7">
          <h1 className="text-2xl font-black text-gray-900">Manage Helmets</h1>
          <p className="text-sm text-gray-400 mt-1">
            Configure, pair, and monitor your smart safety gear.
          </p>
        </div>

        {/* ── Info + Quick Actions ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
          {/* Did you know */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" className="w-5 h-5 shrink-0">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              <span className="text-sm font-bold text-blue-600">Did you know?</span>
            </div>
            <p className="text-sm text-blue-700 leading-relaxed">
              You can pair multiple helmets but only{' '}
              <span className="font-black">one</span> can be active at a time for real-time safety
              tracking and HUD data streaming.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <p className="text-base font-black text-gray-900 mb-3">Quick Actions</p>
            <button
              onClick={() => setShowPairModal(true)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c2440a, #b83208)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" strokeLinecap="round" />
              </svg>
              Pair New Device
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Join thousands of riders in the IoT ecosystem.
            </p>
          </div>
        </div>

        {/* ── Paired Devices ───────────────────────────────────────── */}
        <h2 className="text-base font-black text-gray-800 mb-4">
          Paired Devices ({helmets.length})
        </h2>

        <div className="space-y-4">
          {helmets.map((helmet) => {
            const isEditing = editingId === helmet.id;
            const isConnected = helmet.connection === 'connected';

            return (
              <div
                key={helmet.id}
                className={`bg-white rounded-2xl border-2 shadow-sm transition-all relative overflow-hidden ${
                  helmet.isActive ? 'border-blue-400' : 'border-gray-100'
                }`}
              >
                {/* ACTIVE badge */}
                {helmet.isActive && (
                  <div className="absolute top-0 right-0">
                    <span className="block bg-blue-500 text-white text-xs font-black px-3 py-1 rounded-bl-xl tracking-widest">
                      ACTIVE
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Helmet image */}
                    <HelmetIcon className="w-16 h-16 shrink-0" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && commitEdit(helmet.id)}
                              onBlur={() => commitEdit(helmet.id)}
                              className="text-base font-bold text-gray-900 border-b-2 border-amber-400 bg-transparent focus:outline-none w-48"
                            />
                            <button
                              onClick={() => commitEdit(helmet.id)}
                              className="text-xs font-semibold text-green-600 hover:text-green-700"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-base font-black text-gray-900">
                              {helmet.name}
                            </span>
                            <button
                              onClick={() => startEdit(helmet)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              aria-label="Edit name"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 font-mono mt-0.5 mb-4">
                        ID: {helmet.deviceId}
                      </p>

                      {/* Battery + Connection */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            Battery
                          </p>
                          <BatteryBar level={helmet.battery} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                            Connection
                          </p>
                          <div className="flex items-center gap-1.5">
                            <BluetoothIcon connected={isConnected} />
                            <span
                              className={`text-sm font-black tracking-wide ${
                                isConnected ? 'text-blue-500' : 'text-gray-400'
                              }`}
                            >
                              {isConnected ? 'CONNECTED' : 'OFFLINE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      {/* Set Active toggle (only for non-active) */}
                      {!helmet.isActive && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Set Active
                          </span>
                          <Toggle
                            checked={helmet.isActive}
                            onChange={(v) => handleSetActive(helmet.id, v)}
                          />
                        </div>
                      )}

                      {/* Update + Delete */}
                      <div className="flex items-center gap-2">
                        {/* Firmware update */}
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 transition-colors"
                          title="Update firmware"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                          </svg>
                        </button>

                        {/* Delete */}
                        {deleteConfirmId === helmet.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(helmet.id)}
                              className="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 text-xs font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(helmet.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                            title="Remove helmet"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" />
                              <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {helmets.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="w-12 h-12 mb-3">
                <circle cx="12" cy="10" r="4" />
                <path d="M5.5 20a8.38 8.38 0 0 1 .9-3.8 8 8 0 0 1 3-2.9A8.31 8.31 0 0 1 12 13" strokeLinecap="round" />
                <path d="M19 17v5M17 19h4" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-bold text-gray-400 mb-3">No helmets paired yet</p>
              <button
                onClick={() => setShowPairModal(true)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #e05a2b, #f0a500)' }}
              >
                Pair your first helmet
              </button>
            </div>
          )}
        </div>

        {/* Active helmet summary bar */}
        {activeHelmet && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-sm text-blue-700">
              <span className="font-black">{activeHelmet.name}</span> is currently active and
              streaming real-time data.
            </p>
          </div>
        )}
      </main>

      {/* Pair Modal */}
      {showPairModal && (
        <PairModal onClose={() => setShowPairModal(false)} onPair={handlePair} />
      )}
    </div>
  );
}