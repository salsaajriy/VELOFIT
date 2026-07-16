'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid,
  FiClock,
  FiThermometer,
  FiUser,
  FiTarget,
  FiMenu,
  FiX,
  FiLogOut,
} from 'react-icons/fi';
import { FaHelmetSafety } from 'react-icons/fa6';

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
    label: 'Goal Achievement',
    href: '/target',
    icon: FiTarget,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: FiUser,
  },
];

function SidebarContent({
  pathname,
  onClose,
  user,
  onLogout,
}: {
  pathname: string | null;
  onClose: (() => void) | null;
  user: { name: string; role: string; avatar?: string } | null;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          >
            <Image
                src="/images/logo-velofit.jpeg"
                alt="Velofit Logo"
                width={36}
                height={36}
                className="h-full w-full object-contain"  // ← GANTI object-cover → object-contain
                priority
              />
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

      <div className="border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <Link href="/profile" className="flex w-full items-center gap-2.5">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user?.name ?? 'User'} avatar`}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-700">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold leading-tight text-gray-800">
                {user?.name || 'Loading...'}
              </p>
              <p className="text-xs text-gray-400">{user?.role || 'User'}</p>
            </div>
          </Link>
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={() => {
              if (onClose) onClose();
              onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50"
          >
            <FiLogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push('/login');
          return;
        }
        
        const res = await fetch("http://127.0.0.1:8000/api/user/profile", {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push('/login');
          return;
        }

        const response = await res.json();
        console.log("SIDEBAR RESPONSE:", response);
        
        // PERBAIKAN: Ambil data dari response.data
        const userData = response.data || response;
        
        setUser({
          name: userData.name || 'User',
          role: userData.role || 'user',
          avatar: userData.avatar || null,
        });
      } catch (err) {
        console.error("SIDEBAR USER ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://127.0.0.1:8000/api/auth/logout", {
          method: 'POST',
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {
          // Even if server logout fails, clear local data
        });
      }
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      router.push('/login');
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        {/* Desktop Sidebar Loading */}
        <aside className="fixed z-20 hidden h-full w-52 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 px-4 py-5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gray-200 animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 px-3 py-4 space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-2 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Mobile Top Bar Loading */}
        <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
        </header>
      </>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed z-20 hidden h-full w-52 shrink-0 flex-col border-r border-gray-100 bg-white lg:flex">
        <SidebarContent pathname={pathname} onClose={null} user={user} onLogout={handleLogout} />
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
        <SidebarContent 
          pathname={pathname} 
          onClose={() => setMobileOpen(false)} 
          user={user} 
          onLogout={handleLogout}
        />
      </aside>
    </>
  );
}
