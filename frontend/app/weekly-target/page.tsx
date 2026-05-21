'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';

// ============================================================
// TYPES - Berdasarkan struktur Goal dari Google Fit API [citation:6]
// ============================================================

type GoalPeriod = 'DAILY' | 'WEEKLY';
type MetricType = 'DISTANCE' | 'STEPS' | 'CALORIES';

interface FitnessGoal {
  id: string;
  metric: MetricType;
  targetValue: number;      // target dalam km (distance) atau kkal (calories)
  period: GoalPeriod;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  currentProgress: number;  // progress saat ini dalam periode berjalan
}

interface DailyActivity {
  date: string;
  distance: number;   // km
  steps: number;      // langkah
  calories: number;   // kkal
}

interface WeeklySummary {
  weekStart: string;
  totalDistance: number;
  totalSteps: number;
  totalCalories: number;
  averageDaily: number;
}

// ============================================================
// DUMMY DATA - Simulasi data aktivitas harian
// ============================================================

const generateDummyDailyData = (startDate: string, days: number): DailyActivity[] => {
  const data: DailyActivity[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Simulasi variasi aktivitas harian
    const baseDistance = 4 + Math.random() * 6;
    const baseSteps = baseDistance * 1300;
    const baseCalories = baseDistance * 50;
    
    data.push({
      date: dateStr,
      distance: Math.round(baseDistance * 10) / 10,
      steps: Math.round(baseSteps),
      calories: Math.round(baseCalories),
    });
  }
  return data;
};

// Data dummy 30 hari terakhir
const dummyDailyActivities: DailyActivity[] = generateDummyDailyData('2026-04-13', 30);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function calculateWeeklySummaries(activities: DailyActivity[]): WeeklySummary[] {
  const weeklyMap = new Map<string, { distance: number; steps: number; calories: number; days: number }>();
  
  activities.forEach(activity => {
    const weekStart = getWeekStart(new Date(activity.date));
    const existing = weeklyMap.get(weekStart);
    if (existing) {
      existing.distance += activity.distance;
      existing.steps += activity.steps;
      existing.calories += activity.calories;
      existing.days += 1;
    } else {
      weeklyMap.set(weekStart, {
        distance: activity.distance,
        steps: activity.steps,
        calories: activity.calories,
        days: 1,
      });
    }
  });
  
  return Array.from(weeklyMap.entries()).map(([weekStart, data]) => ({
    weekStart,
    totalDistance: Math.round(data.distance * 10) / 10,
    totalSteps: data.steps,
    totalCalories: data.calories,
    averageDaily: Math.round((data.distance / data.days) * 10) / 10,
  }));
}

// ============================================================
// PROGRESS RING COMPONENT - Mirip Google Fit [citation:1]
// ============================================================

interface ProgressRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  unit: string;
}

function ProgressRing({ 
  current, 
  target, 
  size = 120, 
  strokeWidth = 8,
  color = '#e8571e',
  label,
  unit 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(Math.max((current / target) * 100, 0), 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{current}</span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <p className="text-xs text-gray-400">Target: {target} {unit}</p>
      </div>
    </div>
  );
}

// ============================================================
// GOAL CARD - Card untuk setiap metrik (mirip Google Fit) [citation:9]
// ============================================================

interface GoalCardProps {
  title: string;
  metric: MetricType;
  current: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  onEdit: () => void;
}

function GoalCard({ title, current, target, unit, icon, color, onEdit, metric }: GoalCardProps) {
  const percent = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <div className="text-xl">{icon}</div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-400">Target {unit === 'km' ? 'mingguan' : metric === 'WEEKLY' ? 'mingguan' : 'harian'}</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-orange-500 transition-colors p-1"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
      
      <div className="mb-3">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-2xl font-black" style={{ color }}>{current.toLocaleString()}</span>
          <span className="text-sm text-gray-400">/ {target.toLocaleString()} {unit}</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{percent}% tercapai</p>
      </div>
    </div>
  );
}

// ============================================================
// ONBOARDING GOAL SETUP - Pengaturan target awal (mirip Google Fit) [citation:1][citation:10]
// ============================================================

interface OnboardingModalProps {
  onComplete: (goals: { distance: number; period: GoalPeriod }) => void;
  onSkip: () => void;
}

function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [distance, setDistance] = useState<number>(5);
  const [period, setPeriod] = useState<GoalPeriod>('DAILY');
  const [step, setStep] = useState<1 | 2>(1);
  
  // Rekomendasi dari AHA: 150 menit per minggu ~ setara 5km/hari [citation:1]
  const recommendations = {
    DAILY: {
      min: 3,
      recommended: 5,
      max: 15,
      label: 'Rekomendasi: 5 km/hari (setara 30-45 menit jalan cepat)'
    },
    WEEKLY: {
      min: 20,
      recommended: 35,
      max: 100,
      label: 'Rekomendasi: 35 km/minggu (setara 150 menit aktivitas moderat)'
    }
  };
  
  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete({ distance, period });
    }
  };
  
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with step indicator */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-gray-900">
                {step === 1 ? 'Tentukan Target Anda' : 'Atur Target Jarak'}
              </h2>
              <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 text-sm">
                Lewati
              </button>
            </div>
            <div className="flex gap-1">
              <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
            </div>
          </div>
          
          <div className="p-6">
            {step === 1 ? (
              <div className="space-y-6">
                <p className="text-gray-600 text-sm">
                  Google Fit membantu Anda tetap aktif dengan target yang realistis. 
                  Pilih apakah Anda ingin target harian atau mingguan.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPeriod('DAILY')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      period === 'DAILY' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <div className="font-bold text-gray-900">Daily</div>
                    <div className="text-xs text-gray-500">Target setiap hari</div>
                  </button>
                  
                  <button
                    onClick={() => setPeriod('WEEKLY')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      period === 'WEEKLY' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-bold text-gray-900">Weekly</div>
                    <div className="text-xs text-gray-500">Target fleksibel per minggu</div>
                  </button>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-700">
                    💡 {period === 'DAILY' 
                      ? 'Target harian cocok untuk rutinitas konsisten setiap hari.' 
                      : 'Target mingguan lebih fleksibel - Anda bisa beradaptasi dengan jadwal sibuk atau liburan.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-gray-600 text-sm">
                  {recommendations[period].label}
                </p>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Jarak
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min={recommendations[period].min}
                      max={recommendations[period].max}
                      step={period === 'DAILY' ? 0.5 : 1}
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>{recommendations[period].min} km</span>
                      <span>{recommendations[period].recommended} km</span>
                      <span>{recommendations[period].max} km</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-3xl font-black text-orange-500">{distance}</span>
                    <span className="text-gray-500 ml-1">km {period === 'DAILY' ? 'per hari' : 'per minggu'}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600">
                    🔄 {period === 'DAILY' 
                      ? 'Setiap hari, target akan di-reset. Anda bisa mengubah target kapan saja di halaman Profile.'
                      : 'Target mingguan memberikan kebebasan mengatur intensitas harian - yang penting total tercapai dalam seminggu.'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 pb-6 flex gap-3">
            {step === 1 && (
              <button onClick={onSkip} className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200">
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #e8571e, #f0a500)' }}
            >
              {step === 1 ? 'Lanjutkan' : 'Mulai'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// EDIT GOAL MODAL
// ============================================================

interface EditGoalModalProps {
  metric: MetricType;
  currentTarget: number;
  period: GoalPeriod;
  currentProgress: number;
  unit: string;
  onSave: (newTarget: number) => void;
  onClose: () => void;
}

function EditGoalModal({ metric, currentTarget, period, currentProgress, unit, onSave, onClose }: EditGoalModalProps) {
  const [target, setTarget] = useState(String(currentTarget));
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    onSave(Number(target));
    setSaving(false);
    onClose();
  };
  
  const getRecommendation = () => {
    if (metric === 'DISTANCE') {
      if (period === 'DAILY') return { min: 2, max: 20, step: 0.5, recommended: 5 };
      return { min: 15, max: 100, step: 1, recommended: 35 };
    }
    // CALORIES
    if (period === 'DAILY') return { min: 100, max: 1000, step: 50, recommended: 300 };
    return { min: 1000, max: 7000, step: 100, recommended: 2100 };
  };
  
  const rec = getRecommendation();
  const numTarget = Number(target);
  
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900">
              Ubah Target {metric === 'DISTANCE' ? 'Jarak' : 'Kalori'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Progress saat ini: {currentProgress} {unit}
            </p>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="number"
                  step={rec.step}
                  min={rec.min}
                  max={rec.max}
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-semibold text-center text-xl"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {unit}
                </span>
              </div>
              <input
                type="range"
                min={rec.min}
                max={rec.max}
                step={rec.step}
                value={numTarget}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full mt-3 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Ringan</span>
              <span>Rekomendasi: {rec.recommended}</span>
              <span>Intens</span>
            </div>
          </div>
          
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200">
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #e8571e, #f0a500)' }}
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// WEEKLY HISTORY CHART
// ============================================================

interface WeeklyHistoryChartProps {
  weeklySummaries: WeeklySummary[];
  weeklyTarget: number;
}

function WeeklyHistoryChart({ weeklySummaries, weeklyTarget }: WeeklyHistoryChartProps) {
  const last8Weeks = weeklySummaries.slice(-8);
  const maxValue = Math.max(
    ...last8Weeks.map(w => w.totalDistance),
    weeklyTarget
  );
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900">Riwayat Perbandingan Mingguan</h3>
          <p className="text-xs text-gray-400">Bandingkan pencapaian dengan target mingguan</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-t from-gray-300 to-gray-400" />
            <span className="text-xs text-gray-500">Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-t from-orange-500 to-orange-600" />
            <span className="text-xs text-gray-500">Aktual</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end gap-2 h-64 overflow-x-auto pb-4">
        {last8Weeks.map((week) => {
          const actual = week.totalDistance;
          const target = weeklyTarget;
          const actualPercent = (actual / maxValue) * 100;
          const targetPercent = (target / maxValue) * 100;
          const achievedPercent = Math.min(Math.round((actual / target) * 100), 100);
          
          return (
            <div key={week.weekStart} className="flex flex-col items-center gap-2 min-w-[70px]">
              <div className="relative flex items-end gap-1 h-48">
                <div
                  className="w-7 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg transition-all duration-500"
                  style={{ height: `${targetPercent}%`, minHeight: '4px' }}
                />
                <div
                  className="w-7 bg-gradient-to-t from-orange-500 to-orange-600 rounded-t-lg transition-all duration-500"
                  style={{ height: `${actualPercent}%`, minHeight: '4px' }}
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-gray-600">{formatDate(week.weekStart)}</div>
                <div className={`text-xs font-bold mt-1 ${achievedPercent >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
                  {actual.toFixed(1)}/{target}km
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE - Mirip Google Fit [citation:1][citation:2]
// ============================================================

export default function GoogleFitStylePage() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activePeriod, setActivePeriod] = useState<GoalPeriod>('DAILY');
  const [distanceGoal, setDistanceGoal] = useState<number>(5);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(300);
  const [goalHistory, setGoalHistory] = useState<FitnessGoal[]>([]);
  
  // Edit modal state
  const [editingMetric, setEditingMetric] = useState<MetricType | null>(null);
  
  // Hitung progress saat ini
  const today = new Date().toISOString().split('T')[0];
  const todayActivity = dummyDailyActivities.find(a => a.date === today) || {
    date: today,
    distance: 4.2,
    steps: 5460,
    calories: 210,
  };
  
  const currentWeekStart = getWeekStart(new Date());
  const currentWeekActivities = dummyDailyActivities.filter(
    a => getWeekStart(new Date(a.date)) === currentWeekStart
  );
  
  const weeklySummary: WeeklySummary = {
    weekStart: currentWeekStart,
    totalDistance: currentWeekActivities.reduce((sum, a) => sum + a.distance, 0),
    totalSteps: currentWeekActivities.reduce((sum, a) => sum + a.steps, 0),
    totalCalories: currentWeekActivities.reduce((sum, a) => sum + a.calories, 0),
    averageDaily: currentWeekActivities.length > 0 
      ? currentWeekActivities.reduce((sum, a) => sum + a.distance, 0) / currentWeekActivities.length 
      : 0,
  };
  
  const weeklySummaries = calculateWeeklySummaries(dummyDailyActivities);
  
  const currentDistance = activePeriod === 'DAILY' ? todayActivity.distance : weeklySummary.totalDistance;
  const currentCalories = activePeriod === 'DAILY' ? todayActivity.calories : weeklySummary.totalCalories;
  
  const distanceUnit = activePeriod === 'DAILY' ? 'km/hari' : 'km/minggu';
  const caloriesUnit = activePeriod === 'DAILY' ? 'kkal/hari' : 'kkal/minggu';
  
  const handleOnboardingComplete = (goals: { distance: number; period: GoalPeriod }) => {
    setActivePeriod(goals.period);
    setDistanceGoal(goals.distance);
    // Estimate calories goal based on distance (approx 50kcal per km)
    setCaloriesGoal(Math.round(goals.distance * 50));
    setShowOnboarding(false);
    
    // Save to history
    const newGoal: FitnessGoal = {
      id: Date.now().toString(),
      metric: 'DISTANCE',
      targetValue: goals.distance,
      period: goals.period,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true,
      currentProgress: 0,
    };
    setGoalHistory([newGoal]);
  };
  
  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
  };
  
  const handleEditDistanceGoal = (newTarget: number) => {
    setDistanceGoal(newTarget);
    // Optional: update estimated calories goal
    setCaloriesGoal(Math.round(newTarget * 50));
  };
  
  const handleEditCaloriesGoal = (newTarget: number) => {
    setCaloriesGoal(newTarget);
  };
  
  // Header ring progress aggregation (mirip Google Fit dengan concentric circles) [citation:1]
  const overallDistancePct = Math.min((currentDistance / distanceGoal) * 100, 100);
  const overallCaloriesPct = Math.min((currentCalories / caloriesGoal) * 100, 100);
  const overallAvgPct = (overallDistancePct + overallCaloriesPct) / 2;
  
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-6 p-6 lg:p-8 overflow-y-auto">
        
        {/* Header with Period Toggle - seperti Google Fit yang bisa pilih daily/weekly [citation:2] */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Fitness Goals</h1>
            <p className="text-sm text-gray-500">Pantau aktivitas dan target Anda</p>
          </div>
          
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActivePeriod('DAILY')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activePeriod === 'DAILY'
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={activePeriod === 'DAILY' ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' } : {}}
            >
              Daily
            </button>
            <button
              onClick={() => setActivePeriod('WEEKLY')}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activePeriod === 'WEEKLY'
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={activePeriod === 'WEEKLY' ? { background: 'linear-gradient(135deg,#e8571e,#f0a500)' } : {}}
            >
              Weekly
            </button>
          </div>
        </div>
        
        {/* Main Progress Ring - Mirip Google Fit dengan concentric circles [citation:1] */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {activePeriod === 'DAILY' ? 'Hari Ini' : `Minggu Ini (${formatDate(currentWeekStart)})`}
              </p>
              <h2 className="text-2xl font-black text-gray-900">
                {activePeriod === 'DAILY' ? formatFullDate(today) : `Week of ${formatDate(currentWeekStart)}`}
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-md">
                {activePeriod === 'DAILY' 
                  ? 'Jaga konsistensi dengan mencapai target harian Anda.'
                  : 'Target mingguan memberi fleksibilitas - atur intensitas sesuai jadwal Anda.'}
              </p>
            </div>
            
            <div className="relative">
              {/* Outer ring untuk overall progress */}
              <div className="relative" style={{ width: 180, height: 180 }}>
                <svg width={180} height={180} className="transform -rotate-90">
                  <circle
                    cx={90}
                    cy={90}
                    r={82}
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth={12}
                  />
                  <circle
                    cx={90}
                    cy={90}
                    r={82}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth={12}
                    strokeLinecap="round"
                    strokeDasharray={515.2}
                    strokeDashoffset={515.2 * (1 - overallAvgPct / 100)}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e8571e" />
                      <stop offset="100%" stopColor="#f0a500" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-900">{Math.round(overallAvgPct)}</span>
                  <span className="text-xs text-gray-400">persen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Goals Cards - Seperti Google Fit dengan card per metrik [citation:9] */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <GoalCard
            title="Distance"
            metric="DISTANCE"
            current={currentDistance}
            target={distanceGoal}
            unit={distanceUnit}
            icon="🏃"
            color="#e8571e"
            onEdit={() => setEditingMetric('DISTANCE')}
          />
          
          <GoalCard
            title="Calories"
            metric="CALORIES"
            current={currentCalories}
            target={caloriesGoal}
            unit={caloriesUnit}
            icon="🔥"
            color="#c0392b"
            onEdit={() => setEditingMetric('CALORIES')}
          />
        </div>
        
        {/* Weekly History Chart */}
        <WeeklyHistoryChart 
          weeklySummaries={weeklySummaries} 
          weeklyTarget={activePeriod === 'WEEKLY' ? distanceGoal : distanceGoal * 7}
        />
        
        {/* Info Panel - Seperti Google Fit dengan cards edukasi [citation:1] */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <p className="font-semibold text-blue-800 text-sm">Kenapa target ini?</p>
                <p className="text-xs text-blue-600">
                  Berdasarkan rekomendasi AHA, 150 menit aktivitas moderat per minggu 
                  dapat menurunkan risiko penyakit jantung hingga 30% [citation:1].
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <p className="font-semibold text-orange-800 text-sm">Tips untuk Anda</p>
                <p className="text-xs text-orange-600">
                  {activePeriod === 'DAILY' 
                    ? 'Coba bagi target harian jadi beberapa sesi pendek - 10 menit di pagi, sore, dan malam.'
                    : 'Dengan target mingguan, Anda bisa "cadangan" di hari sibuk dan kejar di akhir pekan.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
      </main>
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
      
      {/* Edit Goal Modal */}
      {editingMetric === 'DISTANCE' && (
        <EditGoalModal
          metric="DISTANCE"
          currentTarget={distanceGoal}
          period={activePeriod}
          currentProgress={currentDistance}
          unit={distanceUnit}
          onSave={handleEditDistanceGoal}
          onClose={() => setEditingMetric(null)}
        />
      )}
      
      {editingMetric === 'CALORIES' && (
        <EditGoalModal
          metric="CALORIES"
          currentTarget={caloriesGoal}
          period={activePeriod}
          currentProgress={currentCalories}
          unit={caloriesUnit}
          onSave={handleEditCaloriesGoal}
          onClose={() => setEditingMetric(null)}
        />
      )}
    </div>
  );
}