'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTarget } from '@/hooks/useTarget';
import type { TargetType } from '@/types/target';

export default function TargetCard() {
  const dailyTargetQuery = useTarget('daily');
  const weeklyTargetQuery = useTarget('weekly');

  const useWeekly = !dailyTargetQuery.loading && !dailyTargetQuery.error && !dailyTargetQuery.activeTarget;
  const activeType: TargetType = useWeekly ? 'weekly' : 'daily';
  const {
    activeTarget,
    loading,
    error,
  } = useWeekly ? weeklyTargetQuery : dailyTargetQuery;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div className="h-8 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-2 bg-gray-200 rounded-full" />
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Target</p>
            <p className="text-xs text-gray-400">Failed to load data</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-2 text-center text-xs font-medium text-orange-500 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
        >
          Retry →
        </button>
      </div>
    );
  }

  if (!activeTarget) {
    return (
      <Link href="/target">
        <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-gray-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Fitness Target</p>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>
          
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-8 h-8">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">No Target Set</p>
            <p className="text-xs text-gray-400 mt-1">Set your daily/weekly goal</p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-orange-500 group-hover:underline">
              Set Target →
            </div>
          </div>
        </div>
      </Link>
    );
  }

  const targetDistance = activeTarget.distance;
  const currentProgress = activeTarget.progress.current;
  const remaining = activeTarget.progress.remaining;
  const percent = activeTarget.progress.percent;
  const isComplete = percent >= 100;

  return (
    <Link href="/target">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" className="w-4 h-4">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Fitness Target</p>
              <p className="text-[10px] text-gray-400 capitalize">{activeType}</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            isComplete 
              ? 'bg-green-50 text-green-600' 
              : percent >= 70 
                ? 'bg-amber-50 text-amber-600'
                : 'bg-gray-100 text-gray-500'
          }`}>
            {isComplete ? '✅ Complete' : `${Math.round(percent)}%`}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-black text-gray-900">
                {currentProgress.toFixed(1)}
                <span className="text-sm font-medium text-gray-400 ml-1">km</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Target</p>
              <p className="text-sm font-bold text-gray-600">{targetDistance} km</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  isComplete ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            {/* Marker target */}
            <div 
              className="absolute top-0 w-0.5 h-2 bg-gray-400"
              style={{ left: '100%' }}
            />
          </div>

          {/* Stats */}
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">
              {isComplete ? '🎉 Target achieved!' : `${remaining.toFixed(1)} km remaining`}
            </span>
            <span className="text-gray-400">
              {activeType === 'daily' ? 'Today' : 'This week'}
            </span>
          </div>
        </div>

        {/* Action */}
        <button 
            onClick={() => window.location.href = '/target'}
            className="mt-3 pt-3 border-t border-gray-100 flex justify-end cursor-pointer">
            <span className="text-[10px] text-orange-500 font-medium group-hover:underline">
                View Details →
            </span>
        </button>
      </div>
    </Link>
  );
}