"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";
import AuthCallbackContent from "./AuthCallbackContent";

export default function AuthCallbackPage() {
  //   const router = useRouter();
  //   const searchParams = useSearchParams();
  //   const [error, setError] = useState<string | null>(null);

  //   useEffect(() => {
  //     const token = searchParams.get('token');
  //     const type = searchParams.get('type');
  //     const errorParam = searchParams.get('error');

  //     if (errorParam) {
  //       setTimeout(() => {
  //         setError('Google login failed. Please try again.');
  //         setTimeout(() => router.push('/login'), 3000);
  //       }, 0);
  //       return;
  //     }

  //     if (token && type === 'google') {
  //       localStorage.setItem('token', token);

  //       const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

  //       fetch(`${BACKEND_URL}/api/user/profile`, {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Accept': 'application/json',
  //         },
  //       })
  //         .then(res => res.json())
  //         .then(data => {
  //           if (data.status && data.data) {
  //             // Simpan role dan data user
  //             localStorage.setItem('user_role', data.data.role);
  //             localStorage.setItem('user_data', JSON.stringify(data.data));

  //             // ✅ Redirect berdasarkan role
  //             if (data.data.role === 'admin') {
  //               router.push('/admin/dashboard');
  //             } else {
  //               router.push('/dashboard');
  //             }
  //           } else {
  //             router.push('/login');
  //           }
  //         })
  //         .catch(() => {
  //           router.push('/login');
  //         });
  //     } else {
  //       router.push('/login');
  //     }
  //   }, [searchParams, router]);

  //   if (error) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //         <div className="text-center">
  //           <div className="text-red-600 text-xl mb-4">⚠️ {error}</div>
  //           <p className="text-gray-500">Redirecting to login page...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600 text-sm">Logging you in with Google...</p>
  //       </div>
  //     </div>
  //   );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Logging you in...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
