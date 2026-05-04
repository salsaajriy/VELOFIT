import axios from '@/lib/axios';

export type RideStatus = 'Completed' | 'Incompleted';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  name: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  distance: string;       // "42.5 km"
  duration: string;       // "1h 45m"
  duration_s: number;     // raw seconds
  status: RideStatus;
  avgSpeed: number;
  calories: number;
  routeCoords: [number, number][];   // [[lat, lng], ...]
}

export interface StartRideResponse {
  message: string;
  ride_id: number;
  started_at: string;
}

export interface FinishRidePayload {
  distance: number;       // km
  duration: number;       // seconds
  calories: number;
  route: RoutePoint[];    // [{lat, lng}, ...]
}

export interface FinishRideResponse {
  message: string;
  ride: Ride;
}

export interface HistoryResponse {
  rides: Ride[];
}

// ── API calls ──────────────────────────────────────────────────────────────

/**
 * POST /api/ride/start
 * Create a new active ride session.
 */
export async function apiStartRide(name?: string) {
  const response = await axios.post('/rides/start', { name });
  return response.data;
}

/**
 * POST /api/ride/finish/:id
 * Send tracking data and close the ride.
 */
export async function apiFinishRide(
  rideId: number,
  payload: FinishRidePayload,
): Promise<FinishRideResponse> {
  const { data } = await axios.post<FinishRideResponse>(
    `/ride/finish/${rideId}`,
    payload,
  );
  return data;
}

/**
 * GET /api/ride/history
 * Fetch all completed/incomplete rides for the authenticated user.
 */
export async function apiGetHistory(): Promise<Ride[]> {
  const { data } = await axios.get<HistoryResponse>('/ride/history');
  return data.rides;
}

/**
 * GET /api/ride/:id
 * Fetch a single ride (with full routeCoords).
 */
export async function apiGetRide(id: string): Promise<Ride> {
  const { data } = await axios.get<{ ride: Ride }>(`/ride/${id}`);
  return data.ride;
}