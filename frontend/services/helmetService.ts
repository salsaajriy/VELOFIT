const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('token') ?? '';
}

export interface Helmet {
  id: number;
  deviceId: string;
  deviceName: string;
  battery: number;
  isActive: boolean;
  lastSeen: string | null;
  batteryLow: boolean;
}

export type ConnectionStatus = 'connected' | 'offline';

export function getConnectionStatus(lastSeen: string | null): ConnectionStatus {
  if (!lastSeen) return 'offline';
  const diff = Date.now() - new Date(lastSeen).getTime();
  return diff < 30000 ? 'connected' : 'offline';
}

class HelmetService {
  async getHelmets(): Promise<Helmet[]> {
    try {
      const res = await fetch(`${API_BASE}/helmets`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to fetch helmets');
      return data.data;
    } catch (error) {
      console.error('Failed to fetch helmets:', error);
      return [];
    }
  }

  async getActiveHelmet(): Promise<Helmet | null> {
    const helmets = await this.getHelmets();
    return helmets.find(h => h.isActive) || helmets[0] || null;
  }
}

export const helmetService = new HelmetService();