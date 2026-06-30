'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {api} from '@/services/api';
import Sidebar from '@/components/sidebar';
import RecentRides from '@/components/RecentRides';
import TargetCard from '@/components/RecentTarget';
import HelmetStatusCard from '@/components/HelmetStatus';
import CompleteProfileModal from '@/components/CompleteProfile';
import TemperatureCard from '@/components/TemperatureCard';
import { Weather } from '@/types';
import { getWeatherTheme } from "@/utils/weatherTheme";

export default function DashboardPage() {
  const [weather, setWeather] = useState<Weather>();
  const weatherTheme = getWeatherTheme(weather?.condition ?? "");
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [rideActive, setRideActive] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (rideActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [rideActive]);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const profile = await api.getUserProfile();

        if (!profile.profile_completed) {
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    checkProfile();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await api.getCurrentWeather(
            position.coords.latitude,
            position.coords.longitude
          );

          setWeather(data);
        } catch (error) {
          console.error("Failed to load weather:", error);
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error(error);
        setWeatherLoading(false);
      }
    );
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 p-6 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-black text-gray-900 my-6">Dashboard</h1>

        <div className="relative rounded-2xl overflow-hidden mb-6 h-52 bg-gray-100">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
                backgroundImage: `url(${weatherTheme.backgroundImage})`
            }}
          />
          <div className="absolute inset-0" 
            style={{
                background: weatherTheme.overlay
            }}
          />
          <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-lg">
            <div className="inline-flex items-center gap-2 mb-3">
              {weatherLoading ? (
                  <span className="text-sm text-gray-500">
                      Loading weather...
                  </span>
              ) : weather ? (
                  <>
                      {/* <img
                          src={weather.icon}
                          className="w-8 h-8"
                          alt={weather.condition}
                      /> */}
                      <span className="font-bold text-gray-800">
                          {weather.temperature}°C
                      </span>
                      <span className="text-gray-500">
                          {weather.condition}
                      </span>
                  </>
              ) : (
                  <span>No weather</span>
              )}
          </div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight mb-5">
              {weatherTheme.title}
            </h2>
            <p className="text-gray-500 mb-6">
                {weatherTheme.subtitle}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/ride')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Start Cycling
              </button>
            </div>
          </div>
        </div>

        <div className="pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6">
                  <path d="M3 3v18h18" strokeLinecap="round" />
                  <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1">Total Distance</p>
              <p className="text-xl font-black text-gray-900">0 km</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="w-6 h-6">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1">Duration</p>
              <p className="text-xl font-black text-gray-900">0m</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="w-6 h-6">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-1">Calories</p>
              <p className="text-xl font-black text-gray-900">0 kcal</p>
            </div>
            
            <HelmetStatusCard />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <TemperatureCard />
          <TargetCard />
        </div>
        
        <RecentRides/>

        {showProfileModal && (
          <CompleteProfileModal
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </main>
    </div>
  );
}