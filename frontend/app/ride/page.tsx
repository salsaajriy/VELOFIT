'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import RideTracker from '@/components/RideTracker';

export default function RidePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <main className="flex-1 lg:ml-52 pt-14 lg:pt-0 px-8 py-8 max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 m-4">Start a Ride</h1>
          <p className="text-sm text-gray-400 m-3">
            GPS tracking will begin automatically
          </p>
        </div>

        <RideTracker
          onRideSaved={() => {
            // Optionally navigate to history after a short delay
            setTimeout(() => router.push('/history'), 2000);
          }}
        />
      </main>
    </div>
  );
}