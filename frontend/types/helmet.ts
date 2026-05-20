export interface Helmet {
  id: number;
  deviceId: string;
  deviceName: string;
  battery: number;
  isActive: boolean;
  lastSeen: string | null;
  batteryLow: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}