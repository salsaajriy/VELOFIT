import axios from 'axios';
import type { RideMode, RidePoint, RideStats, RideDetail, RideHistoryItem, ActiveRide } from '@/types/ride';
 
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, 
});
 
api.interceptors.request.use((config) => {

  const token =
    localStorage.getItem('token') ||         
    localStorage.getItem('auth_token') ||    
    localStorage.getItem('sanctum_token');    

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
export const rideService = {
  async startRide(mode: RideMode) {
    const { data } = await api.post('/rides/start', { mode });
    return data.data as { id: number; started_at: string };
  },
 
  async sendLocations(locations: RidePoint[]) {
    await api.post('/rides/location', {
      locations: locations.map((p) => ({
        latitude:    p.lat,
        longitude:   p.lng,
        speed:       p.speed,
        recorded_at: new Date(p.timestamp).toISOString(),
      })),
    });
  },
 
  async pauseRide(rideId: number) {
    const { data } = await api.post(`/rides/${rideId}/pause`);
    return data.data;
  },
 
  async resumeRide(rideId: number) {
    const { data } = await api.post(`/rides/${rideId}/resume`);
    return data.data;
  },
 
  async finishRide(rideId: number, stats: RideStats) {
    const { data } = await api.post(`/rides/${rideId}/finish`, {
      distance:  stats.distance,
      duration:  stats.duration,
      avg_speed: stats.avgSpeed,
      max_speed: stats.maxSpeed,
    });
    return data.data as RideDetail;
  },
 
  async getHistory(page = 1): Promise<{ data: RideHistoryItem[]; meta: { current_page: number; last_page: number; total: number } }> {
    const { data } = await api.get(`/rides/history?page=${page}&per_page=10`);
    return { data: data.data, meta: data.meta };
  },
 
  async getRideDetail(rideId: number): Promise<RideDetail> {
    const { data } = await api.get(`/rides/${rideId}`);
    return data.data;
  },

  async getActiveRide(): Promise<ActiveRide | null> {
    const { data } = await api.get('/rides/active');
    return data.data;
  }
};
