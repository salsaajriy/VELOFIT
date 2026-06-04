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
    birthDate: '',
    age: '',
    gender: 'male',
    contact1: '',
    contact2: '',
    name1: '',
    name2: '',
  });

  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const BACKEND_URL = "http://127.0.0.1:8000";

  const [bmiData, setBmiData] = useState({
    bmi: 0,
    category: '',
    color: '',
    advice: '',
    idealWeightRange: '',
  });

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
        birthDate: data.birth_date || '',
        age: data.age || '',
        gender: data.gender || 'male',
        contact1: data.contact1 || '',
        contact2: data.contact2 || '',
        name1: data.name1 || '',
        name2: data.name2 || '',
      });

      if (data.avatar) {
        setAvatar(data.avatar);
      }

      if (data.weight && data.height) {
        calculateBMI(data.weight, data.height);
      }
    } catch (err) {
      console.error("FETCH PROFILE ERROR:", err);
    }
  };

  // Fungsi hitung BMI dan dapatkan status
  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height || height === 0) return;
    
    const heightInMeters = height / 100;
    const bmiValue = weight / (heightInMeters * heightInMeters);
    const roundedBMI = Math.round(bmiValue * 10) / 10;
    
    let category = '';
    let color = '';
    let advice = '';
    let idealWeightRange = '';
    
    // Kategori BMI berdasarkan standar Asia/WHO
    if (bmiValue < 18.5) {
      category = 'Underweight';
      color = '#3b82f6'; // blue
      advice = 'You are below the healthy weight range. Consider increasing calorie intake with nutritious foods and consult a nutritionist.';
      const minIdeal = 18.5 * (heightInMeters * heightInMeters);
      const maxIdeal = 24.9 * (heightInMeters * heightInMeters);
      idealWeightRange = `${minIdeal.toFixed(1)} - ${maxIdeal.toFixed(1)} kg`;
    } else if (bmiValue >= 18.5 && bmiValue < 23) {
      category = 'Normal (Optimal)';
      color = '#22c55e'; // green
      advice = 'Great! You are in the healthy weight range. Maintain this with balanced diet and regular exercise.';
      const minIdeal = 18.5 * (heightInMeters * heightInMeters);
      const maxIdeal = 24.9 * (heightInMeters * heightInMeters);
      idealWeightRange = `${minIdeal.toFixed(1)} - ${maxIdeal.toFixed(1)} kg`;
    } else if (bmiValue >= 23 && bmiValue < 27.5) {
      category = 'Overweight';
      color = '#f59e0b'; // amber
      advice = 'You are slightly above the healthy weight range. Small changes in diet and increased physical activity can help.';
      const minIdeal = 18.5 * (heightInMeters * heightInMeters);
      const maxIdeal = 24.9 * (heightInMeters * heightInMeters);
      idealWeightRange = `${minIdeal.toFixed(1)} - ${maxIdeal.toFixed(1)} kg`;
    } else if (bmiValue >= 27.5 && bmiValue < 30) {
      category = 'Obese Class I';
      color = '#ef4444'; // red
      advice = 'You are in the obese category. We strongly recommend consulting a healthcare provider for a personalized weight management plan.';
      const minIdeal = 18.5 * (heightInMeters * heightInMeters);
      const maxIdeal = 24.9 * (heightInMeters * heightInMeters);
      idealWeightRange = `${minIdeal.toFixed(1)} - ${maxIdeal.toFixed(1)} kg`;
    } else if (bmiValue >= 30) {
      category = 'Obese Class II';
      color = '#dc2626'; // dark red
      advice = 'You are in the severely obese category. Please consult a healthcare professional immediately for proper medical guidance.';
      const minIdeal = 18.5 * (heightInMeters * heightInMeters);
      const maxIdeal = 24.9 * (heightInMeters * heightInMeters);
      idealWeightRange = `${minIdeal.toFixed(1)} - ${maxIdeal.toFixed(1)} kg`;
    }
    
    setBmiData({
      bmi: roundedBMI,
      category,
      color,
      advice,
      idealWeightRange,
    });
  };

  // Update BMI saat weight atau height berubah
  useEffect(() => {
    if (form.weight && form.height) {
      calculateBMI(parseFloat(form.weight), parseFloat(form.height));
    }
  }, [form.weight, form.height]);

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

  const [avatar, setAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
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
      console.log("KIRIM:", form);
      
        let formattedBirthDate = null;
      if (form.birthDate) {
        formattedBirthDate = form.birthDate;
      }

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
          birth_date: formattedBirthDate,
          age: Number(form.age),
          gender: form.gender,
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

  const bmiProgress = Math.min(Math.max(((bmiData.bmi - 10) / 30) * 100, 0), 100);

  return (
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-black text-gray-900 mb-6">Profile Settings</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative shrink-0">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg">
                      {avatar ? (
                        <Image
                          src={avatar}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
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
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
                      aria-label="Change photo">
                      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
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
                    <p className="text-2xl font-black text-gray-900">{form.displayName || 'Your Name'}</p>
                    <button
                      className="text-sm font-semibold mt-1 transition-colors hover:opacity-80"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ color: '#c2440a' }}>
                      Replace Photo
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Display Name">
                      <input
                        type="text"
                        value={form.displayName}
                        onChange={handleChange('displayName')}
                        className={inputCls}
                      />
                    </Field>
                    
                    <Field label="Age">
                      <input
                        type="date"
                        value={form.birthDate}
                        onChange={handleChange('birthDate')}
                        placeholder="MM/DD/YYYY"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Current Weight">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={form.weight}
                          onChange={handleChange('weight')}
                          placeholder="70.5"
                          className={inputCls + ' pr-12'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                          kg
                        </span>
                      </div>
                    </Field>

                    <Field label="Current Height">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={form.height}
                          onChange={handleChange('height')}
                          placeholder="175"
                          className={inputCls + ' pr-12'}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                          cm
                        </span>
                      </div>
                    </Field>
                  </div>

                  <Field label="Gender">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="male"
                          checked={form.gender === 'male'}
                          onChange={handleChange('gender')}
                          className="w-4 h-4 accent-amber-600"
                        />
                        <span className="text-sm text-gray-700">Male</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="female"
                          checked={form.gender === 'female'}
                          onChange={handleChange('gender')}
                          className="w-4 h-4 accent-amber-600"
                        />
                        <span className="text-sm text-gray-700">Female</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value="other"
                          checked={form.gender === 'other'}
                          onChange={handleChange('gender')}
                          className="w-4 h-4 accent-amber-600"
                        />
                        <span className="text-sm text-gray-700">Other</span>
                      </label>
                    </div>
                  </Field>

                  <div className="pt-4">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-gray-800 whitespace-nowrap">Emergency Contact</p>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Contact 1 (Phone)">
                      <input
                        type="tel"
                        value={form.contact1}
                        onChange={handleChange('contact1')}
                        placeholder="+62 812 3456 7890"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Name 1">
                      <input
                        type="text"
                        value={form.name1}
                        onChange={handleChange('name1')}
                        placeholder="Emergency contact name"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Contact 2 (Phone)">
                      <input
                        type="tel"
                        value={form.contact2}
                        onChange={handleChange('contact2')}
                        placeholder="+62 812 3456 7890"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Name 2">
                      <input
                        type="text"
                        value={form.name2}
                        onChange={handleChange('name2')}
                        placeholder="Emergency contact name"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleSave}
                    className="px-7 py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg flex items-center gap-2"
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
            </div>

            {/* Right Column - BMI Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BMI</span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Body Mass Index</h3>
                </div>

                {form.weight && form.height ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-5xl font-black mb-1" style={{ color: bmiData.color }}>
                        {bmiData.bmi}
                      </div>
                      <div className="text-sm font-semibold px-3 py-1 rounded-full inline-block" 
                           style={{ backgroundColor: `${bmiData.color}15`, color: bmiData.color }}>
                        {bmiData.category}
                      </div>
                    </div>

                    {/* BMI Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Underweight</span>
                        <span>Normal</span>
                        <span>Overweight</span>
                        <span>Obese</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300"
                             style={{ 
                               width: `${bmiProgress}%`,
                               background: `linear-gradient(90deg, #3b82f6, #22c55e, #f59e0b, #ef4444)`
                             }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>10</span>
                        <span>18.5</span>
                        <span>23</span>
                        <span>27.5</span>
                        <span>40</span>
                      </div>
                    </div>

                    {/* Ideal Weight Range */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Ideal Weight Range</div>
                      <div className="font-semibold text-gray-800">{bmiData.idealWeightRange}</div>
                      <div className="text-xs text-gray-400 mt-1">for height {form.height} cm</div>
                    </div>

                    {/* Health Advice */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-gray-700 leading-relaxed">{bmiData.advice}</p>
                      </div>
                    </div>

                    {/* Health Stats Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-lg font-black text-gray-900">{form.weight}kg</div>
                          <div className="text-xs text-gray-500">Current Weight</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-gray-900">{form.height}cm</div>
                          <div className="text-xs text-gray-500">Height</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Enter your weight and height to calculate BMI</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper components
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