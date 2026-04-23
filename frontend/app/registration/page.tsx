'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser, saveToken } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();

  // ── Form state ─────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // error bisa string (pesan umum) atau object (per-field dari Laravel)
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Handler ────────────────────────────────────────────────

  /** Update field tertentu di state form */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus error field saat user mulai mengetik ulang
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  /** Submit form ke Laravel API */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validasi sisi client (cepat, sebelum kirim ke server)
    if (!agreedToTerms) {
      setError('Kamu harus menyetujui Terms dan Privacy Policy.');
      return;
    }

    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Password tidak cocok.' });
      return;
    }

    setLoading(true);

    try {
      // Kirim ke Laravel POST /api/register
      const data = await registerUser(form);

      // Simpan token ke localStorage
      saveToken(data.access_token);

      // Arahkan ke dashboard
      router.push('/dashboard');
    } catch (err) {
      // err.message sudah diformat oleh apiFetch di lib/api.js
      setError(err.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #f5f5f0 0%, #eef2ec 50%, #f0f5f0 100%)' }}
    >
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Side — Branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 xl:p-16">
          <div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Velofit</span>
          </div>
          <div className="space-y-8">
            <h1 className="text-5xl xl:text-6xl font-black text-gray-900 leading-tight">
              Engineered for{' '}
              <span style={{ color: '#b8860b' }}>Elite</span> Performance.
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
              Join the community of precision riders. Sync your helmet and monitor vitals.
            </p>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                <span className="text-lg">🛡️</span>
                <span className="text-sm font-semibold text-gray-700">Real-time Telemetry</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                <span className="text-lg">❤️</span>
                <span className="text-sm font-semibold text-gray-700">Vitals Tracking</span>
              </div>
            </div>
          </div>
          <div />
        </div>

        {/* Right Side — Form Card */}
        <div className="flex flex-1 lg:w-1/2 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md bg-white rounded-2xl px-8 md:px-10 py-10">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <span className="text-2xl font-black text-gray-900">Velofit</span>
            </div>

            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-[1.85rem] font-bold tracking-tight text-gray-900 mb-1.5">
                Create Account
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Ready to elevate your riding experience?
              </p>
            </div>

            {/* ── Error Banner (pesan umum dari server) ── */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Fill in your full name"
                  required
                  className={inputCls(fieldErrors.name)}
                />
                <FieldError msg={fieldErrors.name} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Fill in your email address"
                  required
                  className={inputCls(fieldErrors.email)}
                />
                <FieldError msg={fieldErrors.email} />
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={inputCls(fieldErrors.password)}
                  />
                  <FieldError msg={fieldErrors.password} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Confirm
                  </label>
                  <input
                    type="password"
                    name="password_confirmation"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className={inputCls(fieldErrors.password_confirmation)}
                  />
                  <FieldError msg={fieldErrors.password_confirmation} />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-amber-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link href="/terms" className="text-amber-600 font-semibold hover:text-amber-700">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-amber-600 font-semibold hover:text-amber-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-white font-bold rounded-2xl transition-all duration-200 hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(90deg, #e05a2b 0%, #f0a500 100%)' }}
              >
                {loading ? (
                  <>
                    {/* Spinner */}
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Google Sign Up */}
            <button className="mt-4 w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Already a precision rider?{' '}
              <Link href="/login" className="text-amber-600 font-bold hover:text-amber-700 transition-colors">
                Login
              </Link>
            </p>

            {/* Decorative bar */}
            <div className="flex gap-2 mt-8">
              <div className="h-1 flex-1 rounded-full" style={{ background: '#b8860b' }} />
              <div className="h-1 w-8 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="h-1 w-4 rounded-full" style={{ background: '#ef4444' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/60 backdrop-blur-sm px-12 py-5">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <span className="text-sm font-bold text-black">Velofit</span>
          {/* <span className="text-sm text-gray-400">Contact Us</span> */}
          <span className="text-sm text-gray-400">© 2026 Velofit. Precision &amp; Safety.</span>
        </div>
      </footer>
    </div>
  );
}

// ── Helper components & styles ─────────────────────────────────

/** Tampilkan error di bawah input */
function FieldError({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

/** Class input — tambah border merah kalau ada error */
function inputCls(hasError: string) {
  return (
    'w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-800 text-sm placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 transition-all ' +
    (hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-amber-400 focus:ring-amber-100')
  );
}