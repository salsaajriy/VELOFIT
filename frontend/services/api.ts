import { ApiResponse, AdminDashboardData, User, LoginResponse } from '@/types';
import type { Helmet, Ride, RideDetail, SensorPayload } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
    
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

  // ========== AUTH ENDPOINTS ==========
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.status && response.access_token) {
      this.setToken(response.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_role', response.role || 'user');
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

  // ========== ADMIN ENDPOINTS ==========
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const response = await this.request<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return response.data!;
  }

  async getAllUsers(role?: 'user' | 'admin'): Promise<User[]> {
    const query = role ? `?role=${role}` : '';
    const response = await this.request<ApiResponse<User[]>>(`/admin/users${query}`);
    return response.data || [];
  }
 
  // ========== USER ENDPOINTS ==========
  async getUserProfile(): Promise<User> {
    const response = await this.request<ApiResponse<User>>('/user/profile');
    console.log('Profile response:', response);
    return response.data!;
  }

  async updateUserProfile(payload: Partial<User>): Promise<User> {
    const response = await this.request<ApiResponse<User>>('/user/profile', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data!;
  }

  // ========== HELMET ENDPOINTS ==========
  async getHelmets(): Promise<Helmet[]> {
    const response = await this.request<{ data: Helmet[] }>('/helmets');
    return response.data;
  }

  async registerHelmet(helmet_name: string, bluetooth_device_name: string): Promise<Helmet> {
    const response = await this.request<{ message: string; data: Helmet }>('/helmets', {
      method: 'POST',
      body: JSON.stringify({ helmet_name, bluetooth_device_name }),
    });
    return response.data;
  }

  async removeHelmet(helmetId: number): Promise<void> {
    await this.request(`/helmets/${helmetId}`, { method: 'DELETE' });
  }

  async validateHelmetConnection(bluetooth_device_name: string): Promise<{ valid: boolean; message: string; data?: Helmet }> {
    return this.request('/helmets/validate-connection', {
      method: 'POST',
      body: JSON.stringify({ bluetooth_device_name }),
    });
  }

  async updateHelmet(helmetId: number, helmet_name: string): Promise<Helmet> {
    const response = await this.request<{ message: string; data: Helmet }>(`/helmets/${helmetId}`, {
      method: 'PUT',
      body: JSON.stringify({ helmet_name }),
    });
    return response.data;
  }

  // ========== RIDE ENDPOINTS ==========
  async startRide(helmet_id: number): Promise<Ride> {
    const response = await this.request<{ message: string; data: Ride }>('/rides/start', {
      method: 'POST',
      body: JSON.stringify({ helmet_id }),
    });
    return response.data;
  }

  async finishRide(rideId: number): Promise<Ride> {
    const response = await this.request<{ message: string; data: Ride }>(`/rides/${rideId}/finish`, {
      method: 'POST',
    });
    return response.data;
  }

  async storeSensorData(rideId: number, payload: SensorPayload & { helmet_id: number }): Promise<void> {
    await this.request(`/rides/${rideId}/sensor-data`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getActiveRide(): Promise<Ride | null> {
    const response = await this.request<{ data: Ride | null }>('/rides/active');
    return response.data;
  }

  async getRideHistory(page: number = 1): Promise<{ data: Ride[]; meta: { current_page: number; last_page: number; total: number } }> {
    return this.request(`/rides/history?page=${page}`);
  }

  async getRideDetail(rideId: number): Promise<RideDetail> {
    const response = await this.request<{ data: RideDetail }>(`/rides/${rideId}`);
    return response.data;
  }

  async getTemperatureHistory(rideId: number) {
    const response = await this.request<{
      data: {
        body_temperature: number;
        room_temperature: number;
        recorded_at: string;
      }[];
    }>(`/rides/${rideId}/temperature-history`);

    return response.data;
  }
  
}

export const api = new ApiService();