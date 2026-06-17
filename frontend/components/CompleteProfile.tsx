'use client';

import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
}

export default function CompleteProfileModal({
  onClose,
}: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Complete Your Profile
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Add your weight to improve calorie calculation
            accuracy and get better cycling insights.
          </p>
        </div>

        <div className="rounded-xl bg-orange-50 p-4 mb-6">
          <p className="text-sm text-orange-700">
            Weight data is required for accurate calorie
            estimation during rides.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/profile')}
            className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Complete Now
          </button>

          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}