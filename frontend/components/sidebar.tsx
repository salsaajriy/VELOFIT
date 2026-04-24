'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid,
  FiClock,
  FiThermometer,
  FiUser,
  FiTarget,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { FaHelmetSafety  } from 'react-icons/fa6';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: FiGrid,
  },
  {
    label: 'History',
    href: '/history',
    icon: FiClock,
  },
  {
    label: 'Body Temperature',
    href: '/temperature',
    icon: FiThermometer,
  },
  {
    label: 'Manage Helmets',
    href: '/helmets',
    icon: FaHelmetSafety,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: FiUser,
  },
  {
    label: 'Weekly Target',
    href: '/weekly-target',
    icon: FiTarget,
  },
];

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string | null;
  onClose: (() => void) | null;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #f97316, #3b82f6)' }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-gray-900">
            Velofit
          </span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose || undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className={isActive ? 'text-amber-600' : 'text-gray-400'}>
                <Icon className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-2.5 border-t border-gray-100 px-4 py-4">
        <Link href="/profile" className="flex w-full items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-700">
            A
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-gray-800">
              Velofit
            </p>
            <p className="text-xs text-gray-400">Pro Rider</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed z-20 hidden h-full w-52 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <SidebarContent pathname={pathname} onClose={null} />
      </aside>

      {/* Mobile Top Bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #f97316, #3b82f6)' }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            </svg>
          </div>
          <span className="text-sm font-black tracking-tight text-gray-900">
            Velofit
          </span>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="Open menu"
        >
          <FiMenu className="h-5 w-5" />
        </button>
      </header>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}