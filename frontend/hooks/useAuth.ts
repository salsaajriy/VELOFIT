import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      router.push('/login');
      return;
    }

    try {
      // Ambil data user dari dashboard admin
      const dashboardData = await api.getAdminDashboard();
      setUser(dashboardData.admin);
      
      // Pastikan role admin
      if (dashboardData.admin.role !== 'admin') {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      api.clearToken();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.logout();
    router.push('/login');
  };

  return { user, loading, logout };
}