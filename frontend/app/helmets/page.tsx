'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/sidebar';
import { api } from '@/services/api';
import { useBLE } from '@/hooks/useBLE';
import type { Helmet } from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────

type ConnectionStatus = 'connected' | 'offline';

interface HelmetWithStatus extends Helmet {
  battery: number;
  lastSeen: string | null;
  batteryLow: boolean;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ── Toast ──────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error';

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
}

function Toast({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold text-white transition-all animate-slide-up ${
        toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
      }`}
    >
      {toast.type === 'success' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4 shrink-0">
          <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4 shrink-0">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      )}
      {toast.message}
    </div>
  );
}

// ── Battery ────────────────────────────────────────────────────────────────

function BatteryBar({ level }: { level: number }) {
  const color = level >= 60 ? '#10b981' : level >= 30 ? '#f59e0b' : '#ef4444';
  const segments = 4;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = ((i + 1) / segments) * 100;
          const filled = level >= threshold - 100 / segments / 2;
          return (
            <div
              key={i}
              className="w-3 h-4 rounded-sm transition-colors"
              style={{ backgroundColor: filled ? color : '#e5e7eb', opacity: filled ? 1 : 0.5 }}
            />
          );
        })}
        <div className="w-1 h-2 rounded-r-sm ml-0.5" style={{ backgroundColor: '#9ca3af' }} />
      </div>
      <span className="text-sm font-black tabular-nums" style={{ color }}>
        {level}%
      </span>
      {level < 20 && (
        <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full tracking-wide">
          LOW
        </span>
      )}
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const connected = status === 'connected';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-widest uppercase ${
        connected
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          : 'bg-gray-100 text-gray-400 border border-gray-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
      {connected ? 'Online' : 'Offline'}
    </span>
  );
}

function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <svg className={`${cls} animate-spin text-current`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

// ── Pair Modal ─────────────────────────────────────────────────────────────

function PairModal({
  onClose,
  onPaired,
  onToast,
}: {
  onClose: () => void;
  onPaired: (helmet: Helmet) => void;
  onToast: (msg: string, type: ToastType) => void;
}) {
  const [helmetName, setHelmetName] = useState('');
  const [bleName, setBleName] = useState('');
  const [bleConnected, setBleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);


const scanBLE = async () => {
  const nav: any = navigator;

  if (!nav.bluetooth) {
    onToast(
      'Web Bluetooth tidak didukung browser ini.',
      'error'
    );
    return;
  }

  try {
    setScanning(true);

    const device = await nav.bluetooth.requestDevice({
      filters: [{ namePrefix: 'VELOFIT' }],
    });

    if (device.name) {
      setBleName(device.name);
      setBleConnected(true);

      onToast(
        `Connected to ${device.name}`,
        'success'
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    setScanning(false);
  }
};
  const handleSubmit = async () => {
    if (!helmetName.trim() || !bleConnected) return;

    setLoading(true);

    try {
      const newHelmet = await api.registerHelmet(
        helmetName.trim(),
        bleName.trim()
      );

      onPaired(newHelmet);

      onToast(
        `"${helmetName}" successfully paired.`,
        'success'
      );

      onClose();
    } catch (err: unknown) {
      onToast(
        err instanceof Error
          ? err.message
          : 'Failed to pair helmet.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full sm:max-w-md sm:mx-4 sm:rounded-2xl rounded-t-3xl shadow-2xl z-10 p-6 pb-8 sm:pb-6">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              Pair New Helmet
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Scan your VELOFIT helmet first
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="w-4 h-4"
            >
              <path
                d="M18 6 6 18M6 6l12 12"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">

          <div>
            <label className="block text-xs font-bold text-gray-500 tracking-widest mb-2">
              HELMET DEVICE
            </label>

            {!bleConnected ? (
              <button
                onClick={scanBLE}
                disabled={scanning}
                className="w-full px-4 py-3 rounded-xl border border-orange-300 bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-all disabled:opacity-50"
              >
                {scanning ? 'Scanning...' : 'Scan BLE Device'}
              </button>
            ) : (
              <div className="w-full px-4 py-3 rounded-xl bg-green-50 border border-green-200">
                <div className="text-xs font-bold text-green-600">
                  CONNECTED
                </div>

                <div className="text-sm font-semibold text-gray-800">
                  {bleName}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 tracking-widest mb-2">
              HELMET NAME
            </label>

            <input
              type="text"
              value={helmetName}
              onChange={(e) => setHelmetName(e.target.value)}
              placeholder="e.g. My Daily Helmet"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={
                loading ||
                !helmetName.trim() ||
                !bleConnected
              }
              className="flex-1 py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  'linear-gradient(135deg, #c2440a, #b83208)',
              }}
            >
              {loading ? <Spinner /> : null}
              {loading ? 'Processing...' : 'Pair Now'}
            </button>

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-lg font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function HelmetCard({
  helmet,
  onRename,
  onDelete,
}: {
  helmet: HelmetWithStatus;
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState(helmet.helmet_name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const connection: ConnectionStatus = helmet.lastSeen 
    ? (new Date().getTime() - new Date(helmet.lastSeen).getTime() < 30000 ? 'connected' : 'offline')
    : 'offline';

  const commitRename = async () => {
    if (editName.trim() && editName.trim() !== helmet.helmet_name) {
      await onRename(helmet.id, editName.trim());
    }
    setEditingName(false);
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    await onDelete(helmet.id);
    setLoadingDelete(false);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-50">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path
                d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z"
                fill='#94a3b8'
              />
              <rect x="4" y="13" width="16" height="3" rx="1.5" fill='#e2e8f0' />
              <rect x="7" y="16" width="10" height="2.5" rx="1.25" fill='#cbd5e1' />
            </svg>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5 pr-16">
              {editingName ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  onBlur={commitRename}
                  className="text-sm font-black text-gray-900 border-b-2 border-orange-400 bg-transparent focus:outline-none w-full max-w-50"
                />
              ) : (
                <>
                  <span className="text-sm font-black text-gray-900 truncate">{helmet.helmet_name}</span>
                  <button
                    onClick={() => { setEditName(helmet.helmet_name); setEditingName(true); }}
                    className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" />
                      <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <p className="text-[11px] font-mono text-gray-400 mb-3 truncate">{helmet.bluetooth_device_name}</p>

            {helmet.lastSeen && (
              <p className="text-[10px] text-gray-300 mt-2">
                Last seen:{' '}
                {new Date(helmet.lastSeen).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">

            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={loadingDelete}
                  className="h-7 px-2.5 text-[11px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {loadingDelete ? <Spinner /> : 'Delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="h-7 px-2 text-[11px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                title="Unpair helm"
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ManageHelmetsPage() {
  const [helmets, setHelmets] = useState<HelmetWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPairModal, setShowPairModal] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // BLE hook untuk koneksi
  const { connect, disconnect, isConnected, isConnecting } = useBLE();

  const showToast = (message: string, type: ToastType) =>
    setToast({ message, type, id: Date.now() });

  const fetchHelmets = useCallback(async () => {
    try {
      const data = await api.getHelmets();
      // Convert to HelmetWithStatus with default values
      const helmetsWithStatus: HelmetWithStatus[] = data.map((h) => ({
        ...h,
        battery: 85,
        lastSeen: null,
        batteryLow: false,
      }));
      setHelmets(helmetsWithStatus);
    } catch (error) {
      console.error('Failed to fetch helmets:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHelmets();
  }, [fetchHelmets]);

  const handleRename = async (id: number, name: string) => {
    try {
      await api.updateHelmet(id, name);
      setHelmets((prev) =>
        prev.map((h) => (h.id === id ? { ...h, helmet_name: name } : h))
      );
      showToast('Helmet name updated successfully.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update helmet name.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    console.log('DELETE ID:', id);
    try {
      await api.removeHelmet(id);
      setHelmets((prev) => prev.filter((h) => h.id !== id));
    
      
      showToast('Helmet successfully unpaired.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to unpair helmet.', 'error');
    }
  };

  const handleBLEConnect = async () => {
    try {
      
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'BLE connection failed.', 'error');
    }
  };

  const connectedCount = helmets.filter((h) => {
    if (!h.lastSeen) return false;
    return new Date().getTime() - new Date(h.lastSeen).getTime() < 30000;
  }).length;

  return (
    <>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out forwards; }
      `}</style>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-5 lg:p-8 mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between mt-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Manage Helmet</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading
                  ? 'Loading helmet data...'
                  : `${helmets.length} Registered Device · ${connectedCount} Online`}
              </p>
            </div>
            <div className="flex gap-3">

              {/* Pair Button */}
              <button
                onClick={() => setShowPairModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm text-white shadow-sm hover:opacity-90 hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg, #c2440a, #b83208)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
                Pair Helmet
              </button>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <Spinner size="md" />
              <span className="text-sm font-semibold">Loading helmet data...</span>
            </div>
          ) : helmets.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-14 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                  <path d="M12 2C8.134 2 5 5.134 5 9v4h14V9c0-3.866-3.134-7-7-7z" fill="#e2e8f0" />
                  <rect x="4" y="13" width="16" height="3" rx="1.5" fill="#cbd5e1" />
                  <rect x="7" y="16" width="10" height="2.5" rx="1.25" fill="#e2e8f0" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-500 mb-1">No Registered Helmet</p>
              <p className="text-xs text-gray-400 mb-5">
                Start by pairing your helmet to view battery level and connection status.
              </p>
              <button
                onClick={() => setShowPairModal(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c2440a, #b83208)' }}
              >
                Pair First Helmet
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {helmets.map((helmet) => (
              <HelmetCard
                key={helmet.id}
                helmet={helmet}
                onRename={handleRename}
                onDelete={handleDelete}
              />
              
              ))}
            </div>
          )}
        </main>
      </div>

      {showPairModal && (
        <PairModal
          onClose={() => setShowPairModal(false)}
          onPaired={(h) => {
            const newHelmet: HelmetWithStatus = {
              ...h,
              battery: 85,
              lastSeen: null,
              batteryLow: false,
            };
            setHelmets((prev) => [...prev, newHelmet]);
          }}
          onToast={showToast}
        />
      )}

      {toast && <Toast key={toast.id} toast={toast} onDone={() => setToast(null)} />}
    </>
  );
}