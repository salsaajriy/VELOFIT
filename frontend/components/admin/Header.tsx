'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-6 md:px-10 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage users and monitor system activity
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-600">
            {format(currentTime, 'EEEE, dd MMMM yyyy', { locale: id })}
          </p>
          <p className="text-xs text-slate-400">
            {format(currentTime, 'HH:mm:ss')}
          </p>
        </div>
      </div>
    </header>
  );
}