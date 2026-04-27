'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import Image from 'next/image';


export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    displayName: '',
    weight: '',
    height: '',
    contact1: '',
    contact2: '',
    name1: '',
    name2: '',
  });

  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);

  const BACKEND_URL = "http://127.0.0.1:8000";

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();

      console.log("PROFILE:", data);

      setForm({
        displayName: data.name || '',
        weight: data.weight || '',
        height: data.height || '',
        contact1: data.contact1 || '',
        contact2: data.contact2 || '',
        name1: data.name1 || '',
        name2: data.name2 || '',
      });

      if (data.avatar) {
        setAvatar(data.avatar);
      }

    } catch (err) {
      console.error("FETCH PROFILE ERROR:", err);
    }
  };

  useEffect(() => {
  const init = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    await fetchProfile();
    setIsChecking(false);
  };

  init();
}, []);

  const [avatar, setAvatar] = useState<string | null>(null); // null = placeholder
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatar(url as string);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
console.log("KIRIM:", form.weight);
      const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.displayName,
          weight: Number(form.weight),
          height: Number(form.height),
          contact1: form.contact1,
          contact2: form.contact2,
          name1: form.name1,
          name2: form.name2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal update");
      }

      setSaved(true);
      await fetchProfile();
      setTimeout(() => setSaved(false), 2500);

    } catch (err) {
      console.error("SAVE ERROR:", err);
    }
  };

  if (isChecking) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 overflow-y-auto">
            <h1 className="text-2xl font-black text-gray-900 my-2 p-6">Profile Settings</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mx-6 max">

          {/* ── Avatar + Name ─────────────────────────── */}
          <div className="flex items-center gap-5 mb-8">
            <div className="relative shrink-0">
              {/* Avatar circle */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-200">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient from-gray-700 to-gray-900">
                    <svg viewBox="0 0 80 80" className="w-full h-full">
                      <rect width="80" height="80" fill="#1f2937" />
                      <circle cx="40" cy="30" r="14" fill="#4b5563" />
                      <ellipse cx="40" cy="68" rx="22" ry="14" fill="#374151" />
                    </svg>
                  </div>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                aria-label="Change photo">
                <svg viewBox="0 0 24 24" fill="white" className="w-3.5 h-3.5">
                  <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div>
              <p className="text-xl font-black text-gray-900">Velofit</p>
              <button
                className="text-sm font-semibold mt-1 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                style={{ color: '#c2440a' }}>
                Replace Photo
              </button>
            </div>
          </div>

          {/* ── Fields ────────────────────────────────── */}
          <div className="space-y-5">
            <Field label="Display Name">
              <input
                type="text"
                value={form.displayName}
                onChange={handleChange('displayName')}
                className={inputCls}
              />
            </Field>

            <Field label="Current Weight (kg)">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={form.weight}
                  onChange={handleChange('weight')}
                  className={inputCls + ' pr-12'}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  kg
                </span>
              </div>
            </Field>

            <Field label="Current Height (cm)">
              <div className="relative">
                <input
                  type="number"
                  value={form.height}
                  onChange={handleChange('height')}
                  className={inputCls + ' pr-12'}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                  cm
                </span>
              </div>
            </Field>

            <div className="pt-2">
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-gray-800 whitespace-nowrap">Emergency Contact</p>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            </div>

            {/* Contact 1 */}
            <Field label="Contact 1">
              <input
                type="tel"
                value={form.contact1}
                onChange={handleChange('contact1')}
                className={inputCls}
              />
            </Field>

            {/* Contact 2 */}
            <Field label="Contact 2">
              <input
                type="tel"
                value={form.contact2}
                onChange={handleChange('contact2')}
                className={inputCls}
              />
            </Field>

            {/* Name 1 */}
            <Field label="Name 1">
              <input
                type="text"
                value={form.name1}
                onChange={handleChange('name1')}
                className={inputCls}
              />
            </Field>

            {/* Name 2 */}
            <Field label="Name 2">
              <input
                type="text"
                value={form.name2}
                onChange={handleChange('name2')}
                className={inputCls}
              />
            </Field>
          </div>

          {/* ── Save Button ───────────────────────────── */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              className="px-7 py-2.5 rounded-tr-lg font-bold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg flex items-center gap-2"
              style={{ background: saved ? '#22c55e' : 'linear-gradient(135deg, #c2440a, #b83208)' }}
            >
              {saved ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Helper components ──────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm ' +
  'placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all';