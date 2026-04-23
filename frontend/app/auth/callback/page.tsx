'use client';
 
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
 
export default function AuthCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
 
  useEffect(() => {
    const token = searchParams.get('token');
    const role  = searchParams.get('role');
    const error = searchParams.get('error');
 
    if (error) {
      router.replace('/auth/login?error=google_failed');
      return;
    }
 
    if (token && role) {
      localStorage.setItem('user_role', role);
      router.replace(role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [searchParams, router]);
 
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Memproses login Google, mohon tunggu...</p>
    </div>
  );
}
