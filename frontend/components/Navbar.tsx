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
  FiLogOut,
  FiHome,
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
    label: 'Temperature',
    href: '/temperature',
    icon: FiThermometer,
  },
  {
    label: 'Helmets',
    href: '/helmets',
    icon: FaHelmetSafety,
  },
  {
    label: 'Target',
    href: '/target',
    icon: FiTarget,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: FiUser,
  },
];

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}` + `api/user/profile`, {
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
        const userData = response.data || response;
        
        setUser({
          name: userData.name || 'User',
          role: userData.role || 'user',
          avatar: userData.avatar || null,
        });
      } catch (err) {
        console.error("NAVBAR USER ERROR:", err);
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
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}` + `api/auth/logout`, {
          method: 'POST',
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <>
        {/* Desktop Navbar Loading */}
        <nav className="fixed left-0 right-0 top-0 z-50 hidden h-16 border-b border-gray-100 bg-white lg:block">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Nav Loading */}
        <div className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-gray-100 bg-white lg:hidden">
          <div className="flex h-full items-center justify-around px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 w-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer untuk konten */}
        <div className="h-16 lg:h-16"></div>
        <div className="h-16 lg:hidden"></div>
      </>
    );
  }

  return (
    <>
      {/* ========== DESKTOP NAVBAR (Top) ========== */}
      <nav className="fixed left-0 right-0 top-0 z-50 hidden border-b border-gray-100 bg-white/80 backdrop-blur-md lg:block">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
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
            <span className="text-lg font-black tracking-tight text-gray-900">
              Velofit
            </span>
          </Link>

          {/* Navigation Items - Center */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-amber-500"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user?.name ?? 'User'}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-bold text-amber-700">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden xl:block">
                <p className="text-sm font-semibold leading-tight text-gray-800">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400">{user?.role || 'User'}</p>
              </div>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
            >
              <FiLogOut className="h-4 w-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========== MOBILE BOTTOM NAVIGATION (Android Style) ========== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-lg lg:hidden">
        <div className="flex h-16 items-center justify-around px-1">
          {/* Tampilkan maksimal 5 menu di bottom nav (ambil 5 pertama) */}
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-all ${
                  isActive ? 'text-amber-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform duration-200`} />
                  {isActive && (
                    <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-amber-600' : 'text-gray-500'}`}>
                  {item.label.length > 8 ? item.label.slice(0, 8) + '...' : item.label}
                </span>
              </Link>
            );
          })}

          {/* Tombol Profile (jika lebih dari 5 menu) */}
          <Link
            href="/profile"
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-all ${
              pathname === '/profile' ? 'text-amber-600' : 'text-gray-500'
            }`}
          >
            <div className="relative">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-700">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              {pathname === '/profile' && (
                <span className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-amber-500"></span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${pathname === '/profile' ? 'text-amber-600' : 'text-gray-500'}`}>
              Profile
            </span>
          </Link>
        </div>
      </nav>


    </>
  );
}