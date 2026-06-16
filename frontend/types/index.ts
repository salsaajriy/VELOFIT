export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  weight: number | null;
  height: number | null;
  contact1: string | null;
  contact2: string | null;
  name1: string | null;
  name2: string | null;
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

// ─── Sensor payload from ESP32 BLE ───────────────────────────────────────────
export interface SensorPayload {
  body: number;    // body temperature °C
  room: number;    // ambient temperature °C
  g: number;       // impact G-force
  gyro?: number;
  lat: number;
  lon: number;
  gpsOk: boolean;
  alert: 0 | 1 | 2; // 0=IDLE 1=COUNTDOWN 2=ALERTING
}

// ─── Helmet ───────────────────────────────────────────────────────────────────
export interface Helmet {
  id: number;
  helmet_name: string;
  bluetooth_device_name: string;
  created_at: string;
}

// ─── Ride ────────────────────────────────────────────────────────────────────
export interface Ride {
  id: number;
  helmet_id: number;
  helmet?: Helmet;
  start_time: string;
  end_time: string | null;
  duration: number | null;    
  distance: number;           
  avg_speed: number;         
  max_speed: number;          
  calories: number;
  status: 'active' | 'completed';
  created_at: string;
}

export interface RideLocation {
  lat: number;
  lon: number;
  recorded_at: string;
}

export interface SensorReading {
  body_temperature: number;
  room_temperature: number;
  impact_g: number;
  alert_state: number;
  recorded_at: string;
}

export interface RideDetail extends Ride {
  route: RideLocation[];
  sensor_readings: SensorReading[];
}

export interface ActiveHelmet {
  helmet: Helmet;
  device: BluetoothDevice;
  characteristic: BluetoothRemoteGATTCharacteristic;
}