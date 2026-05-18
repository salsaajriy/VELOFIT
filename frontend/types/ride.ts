export type RideMode = 'free' | 'navigation';
export type RideStatus =
  | 'idle'
  | 'starting'
  | 'tracking'
  | 'paused'
  | 'finishing'
  | 'completed';
 
export interface Coordinate {
  lat: number;
  lng: number;
}
 
export interface RidePoint extends Coordinate {
  speed: number;
  timestamp: number; // ms epoch
}
 
export interface RideStats {
  distance: number;    // km
  duration: number;    // detik
  avgSpeed: number;    // km/h
  maxSpeed: number;    // km/h
  calories: number;    // kkal
}
 
export interface ActiveRide {
  id: number;
  mode: RideMode;
  status: string;
  startedAt: string;
}
 
export interface RideHistoryItem {
  id: number;
  mode: RideMode;
  status: string;
  distance: number;
  duration: number;
  avgSpeed: number;
  maxSpeed: number;
  calories: number;
  startedAt: string;
  endedAt: string;
}
 
export interface RideDetail extends RideHistoryItem {
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
  locations: Array<{
    lat: number;
    lng: number;
    speed: number;
    recordedAt: string;
  }>;
  alerts: Array<{
    id: number;
    type: string;
    message: string;
  }>;
}
 
export interface RouteInfo {
  coordinates: Coordinate[];
  distance: number;    // km
  duration: number;    // menit
  instructions: RouteInstruction[];
}
 
export interface RouteInstruction {
  distance: number;
  duration: number;
  instruction: string;
  type: number;
}
