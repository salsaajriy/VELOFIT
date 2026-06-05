'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type TargetType = 'Daily' | 'Weekly';

interface TargetHistory {
  id: string;
  type: TargetType;
  distance: number;
  startDate: string;
  endDate?: string;
}

const getDummyProgress = () => {
  const today = new Date().toISOString().split('T')[0];
  const currentWeekStart = getWeekStart(new Date());

  const dummyDailyProgress = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      distance: Math.random() * 10,
    };
  });
  
  const todayProgress = dummyDailyProgress.find(p => p.date === today)?.distance || 0;
  const currentWeekDays = dummyDailyProgress.filter(p => getWeekStart(new Date(p.date)) === currentWeekStart);
  const currentWeekProgress = currentWeekDays.reduce((sum, p) => sum + p.distance, 0);
  
  return { todayProgress, currentWeekProgress };
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export default function RecentTarget() {
  const [activeType, setActiveType] = useState<TargetType>('Weekly');
  const [dailyTarget, setDailyTarget] = useState(5);
  const [weeklyTarget, setWeeklyTarget] = useState(35);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 0, target: 0 });

  useEffect(() => {
    // Fetch target data dari API/localStorage
    const fetchTargetData = async () => {
      setIsLoading(true);
      try {
        // Di sini nanti panggil API yang sama dengan halaman goals
        // Contoh: const response = await targetService.getCurrentTarget();
        
        // Sementara pakai data dummy
        const { todayProgress, currentWeekProgress } = getDummyProgress();
        
        const currentTarget = activeType === 'Daily' ? dailyTarget : weeklyTarget;
        const currentProgress = activeType === 'Daily' ? todayProgress : currentWeekProgress;
        
        setProgress({
          current: currentProgress,
          target: currentTarget,
        });
      } catch (error) {
        console.error('Failed to fetch target:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTargetData();
  }, [activeType, dailyTarget, weeklyTarget]);

  const percent = Math.min(Math.round((progress.current / progress.target) * 100), 100);
  const remaining = Math.max(progress.target - progress.current, 0);
  const circumference = 2 * Math.PI * 38;
  const strokeDashoffset = circumference * (1 - percent / 100);

  if (isLoading) {
    return (
      <Link href="/goals">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-48 mb-4" />
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 rounded-full bg-gray-100" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-100 rounded w-20" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/goals">
      <div className="bg-white rounded-2xl p-1 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-gray-800">
            {activeType === 'Daily' ? 'Daily Target' : 'Weekly Target'}
          </p>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mb-4">
          {activeType === 'Daily' 
            ? `Target ${progress.target} km per day` 
            : `Progress towards ${progress.target} km goal`}
        </p>
        
        <div className="flex justify-center mb-3">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle 
                cx="50" cy="50" r="38" 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="8" 
              />
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke={percent >= 100 ? "#22c55e" : "#3b82f6"}
                strokeWidth="8"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-gray-900">{percent}%</span>
              <span className="text-[10px] text-gray-400 font-semibold">
                {percent >= 100 ? 'ACHIEVED' : 'REACHED'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>{progress.current.toFixed(1)} KM DONE</span>
          <span>{remaining.toFixed(1)} KM LEFT</span>
        </div>
        
        {/* Indicator bahwa ini ringkasan */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span className="text-[10px] text-gray-400">
              {activeType === 'Daily' ? 'Today\'s progress' : 'This week\'s progress'}
            </span>
          </div>
          <div className="text-[10px] font-semibold text-orange-500 group-hover:translate-x-0.5 transition-transform">
            View Details →
          </div>
        </div>
      </div>
    </Link>
  );
}