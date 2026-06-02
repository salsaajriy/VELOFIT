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
  timestamp: number; 
}
 
export interface RideStats {
  distance: number;    
  duration: number;   
  avgSpeed: number;    
  maxSpeed: number;    
  calories: number;    
}
 
export interface ActiveRide {
  id: number;
  mode: RideMode;
  status: string;
  distance: number;
  duration: number;
  avg_speed: number;
  max_speed: number;
  calories: number;
  started_at: string;
}
 
export interface RideHistoryItem {
  id: number;
  mode: RideMode;
  status: string;
  navigation_result: string | null;
  distance: number;
  duration: number;
  avg_speed: number;
  max_speed: number;
  calories: number;
  started_at: string;
  ended_at: string | null;
}
 
export interface RideDetail extends RideHistoryItem {
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  locations: Array<{
    lat: number;
    lng: number;
    speed: number;
    recorded_at: string;
  }>;
  alerts: Array<{
    id: number;
    type: string;
    message: string;
  }>;
}
 
export interface RouteInfo {
  coordinates: Coordinate[];
  distance: number;   
  duration: number;    
  instructions: RouteInstruction[];
}
 
export interface RouteInstruction {
  distance: number;
  duration: number;
  instruction: string;
  type: number;
}

export interface Destination {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
}
