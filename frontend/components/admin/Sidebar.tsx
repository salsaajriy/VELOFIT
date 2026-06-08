'use client';

import { FiGrid, FiUsers, FiLogOut } from 'react-icons/fi';
import { FaHelmetSafety } from 'react-icons/fa6';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  activeTab: 'dashboard' | 'users';
  onTabChange: (tab: 'dashboard' | 'users') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: FiGrid },
    { id: 'users' as const, label: 'Users Management', icon: FiUsers },
  ];

  return (
    <aside className="hidden w-280px flex-col border-r border-slate-200 bg-white md:flex">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-amber-600 text-white shadow-lg">
            <FaHelmetSafety className="text-xl" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Velofit
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-linear-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`text-lg ${isActive ? 'text-orange-600' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-400 to-amber-500 text-white shadow-md">
            <span className="text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Admin'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
            title="Logout"
          >
            <FiLogOut className="text-lg" />
          </button>
        </div>
      </div>
    </aside>
  );
}