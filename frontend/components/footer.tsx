'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiGithub, FiMail, FiMapPin } from 'react-icons/fi';
import { FaHelmetSafety } from 'react-icons/fa6';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Grid Footer */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand / About */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl">
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
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              A platform for monitoring worker safety and health using IoT technology.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-amber-100 hover:text-amber-600"
                aria-label="Email"
              >
                <FiMail className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-amber-100 hover:text-amber-600"
                aria-label="GitHub"
              >
                <FiGithub className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'History', href: '/history' },
                { label: 'Temperature', href: '/temperature' },
                { label: 'Manage Helmets', href: '/helmets' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 transition-colors hover:text-amber-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Support
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-gray-600 transition-colors hover:text-amber-600"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/target"
                  className="text-sm text-gray-600 transition-colors hover:text-amber-600"
                >
                  Goal Achievement
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 transition-colors hover:text-amber-600"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-600 transition-colors hover:text-amber-600"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact
            </h3>
            <ul className="mt-3 space-y-2.5">
              <li className="flex items-start gap-2.5 text-sm text-gray-600">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <span>Batam, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {currentYear} Velofit. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              Made with
              <FiHeart className="h-3 w-3 text-red-500" />
              by Velofit Team
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}