'use client';

import type { RideStatus } from '@/types/ride';
import { Play, Pause, Square, RotateCcw, Bike } from 'lucide-react';

interface RideControlsProps {
  status: RideStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  isLoading?: boolean;
}

export function RideControls({
  status,
  onStart,
  onPause,
  onResume,
  onFinish,
  isLoading = false,
}: RideControlsProps) {
  const isIdle = status === 'idle' || status === 'completed';
  const isTracking = status === 'tracking';
  const isPaused = status === 'paused';
  const isStarting = status === 'starting' || isLoading;

  if (isIdle) {
    return (
      <button
        onClick={onStart}
        disabled={isStarting}
        className="
          w-full py-4 rounded-xl
          bg-linear-to-r from-orange-500 to-orange-600
          text-white font-bold text-lg
          hover:from-orange-600 hover:to-orange-700
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-lg hover:shadow-xl
          flex items-center justify-center gap-2
        "
      >
        {isStarting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <Bike className="w-5 h-5" />
            <span>Start Cycling</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {isTracking ? (
        <button
          onClick={onPause}
          disabled={isLoading}
          className="
            py-3 rounded-xl
            bg-yellow-500 text-white font-semibold
            hover:bg-yellow-600
            transition-all duration-200
            disabled:opacity-50
            flex items-center justify-center gap-2
          "
        >
          <Pause className="w-4 h-4" />
          <span>Pause</span>
        </button>
      ) : (
        <button
          onClick={onResume}
          disabled={isLoading}
          className="
            py-3 rounded-xl
            bg-green-500 text-white font-semibold
            hover:bg-green-600
            transition-all duration-200
            disabled:opacity-50
            flex items-center justify-center gap-2
          "
        >
          <Play className="w-4 h-4" />
          <span>Lanjutkan</span>
        </button>
      )}

      <button
        onClick={onFinish}
        disabled={isLoading}
        className="
          col-span-2 py-3 rounded-xl
          bg-red-500 text-white font-semibold
          hover:bg-red-600
          transition-all duration-200
          disabled:opacity-50
          flex items-center justify-center gap-2
        "
      >
        <Square className="w-4 h-4" />
        <span>Selesai & Simpan</span>
      </button>
    </div>
  );
}