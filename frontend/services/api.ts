import { ApiResponse, AdminDashboardData, User, LoginResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
    
    // Optional: listen untuk localStorage changes (jika login di tab lain)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'token') {
          this.loadToken();
        }
      });
    }
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      console.log('Token loaded:', this.token ? 'Yes (length: ' + this.token.length + ')' : 'No');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      console.log('Token saved, length:', token.length);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_data');
      console.log('Token cleared');
    }
  }

  getToken() {
    // Selalu ambil fresh dari localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();
    
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    console.log(`Request to ${url} with token:`, token ? 'Yes' : 'No');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status for ${endpoint}:`, response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Unauthorized, clearing token');
        this.clearToken();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.status && response.access_token) {
      this.setToken(response.access_token);
      // Simpan juga role
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await this.request<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return response.data!;
  }

  async getAllUsers(role?: 'user' | 'admin'): Promise<User[]> {
    const query = role ? `?role=${role}` : '';
    const response = await this.request<ApiResponse<User[]>>(`/admin/users${query}`);
    return response.data || [];
  }

  async getUserProfile(): Promise<User> {
    const response = await this.request<ApiResponse<User>>('/user/profile');
    return response.data!;
  }
}

export const api = new ApiService();