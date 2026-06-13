export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  avatar?: string | null;
}

export interface DashboardStats {
  total_users: number;
  total_admins: number;
}

export interface AdminDashboardData {
  admin: User;
  status: DashboardStats;
  logged_in_at: string;
}

export interface LoginResponse {
  status: boolean;
  message: string;
  access_token: string;
  token_type: string;
  role: 'user' | 'admin';
  redirect: string;
  user: User;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  message?: string;
  data?: T;
  total?: number;
}