// app/admin/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineUsers } from 'react-icons/hi2';
import { FaHelmetSafety } from 'react-icons/fa6';
import { api } from '@/services/api';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import StatCard from '@/components/admin/StatCard';
import UsersTable from '@/components/admin/UsersTable';
import { DashboardStats, User } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({ total_users: 0, total_admins: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // Cek autentikasi dan role di awal
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    
    console.log('Checking auth - token:', token ? 'Yes' : 'No', 'role:', role);

    if (!token) {
      router.push('/login');
      return;
    }

    if (role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    setAuthChecking(false);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      const dashboardData = await api.getAdminDashboard();
      console.log('Dashboard data:', dashboardData);
      setStats(dashboardData.status);
      
      const allUsers = await api.getAllUsers('user');
      console.log('Users:', allUsers);
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Jika error 401, redirect ke login
      if (error instanceof Error && error.message.includes('Unauthenticated')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-800">
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1">
          <Header />

          <div className="px-6 py-8 md:px-10">
            {activeTab === 'dashboard' ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                  <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={HiOutlineUsers}
                    iconBgColor="bg-gradient-to-br from-green-50 to-emerald-50"
                    iconColor="text-green-600"
                    trend={12}
                  />
                  <StatCard
                    title="Total Admins"
                    value={stats.total_admins}
                    icon={FaHelmetSafety}
                    iconBgColor="bg-gradient-to-br from-purple-50 to-violet-50"
                    iconColor="text-purple-600"
                  />
                </div>

                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Recent Users</h2>
                      <p className="text-sm text-slate-500">Latest registered users</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <UsersTable users={users.slice(0, 5)} loading={loading} />
                </div>
              </>
            ) : (
              <UsersTable users={users} loading={loading} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}