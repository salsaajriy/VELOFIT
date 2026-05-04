'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiStartRide, apiFinishRide, Ride, RoutePoint } from '@/lib/api/rides';
import { getUserProfile } from '@/lib/api/profile';

// ── Types ─────────────────────────────────────────────────────────────────

export type TrackingStatus = 'idle' | 'starting' | 'tracking' | 'finishing' | 'done' | 'error';

export interface RideState {
  status: TrackingStatus;
  rideId: number | null;
  elapsed: number;           // seconds
  distance: number;          // km
  speed: number;             // km/h (current)
  calories: number;
  route: RoutePoint[];       // [{lat, lng}]
  finishedRide: Ride | null; // populated after successful finish
  error: string | null;
  weight: number;           // kg, for calorie estimation
}

// ── Haversine formula ─────────────────────────────────────────────────────

/**
 * Returns distance in km between two GPS coordinates.
 */
function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}


function estimateCalories(
    durationSeconds: number, 
    avgSpeedKmh: number,
    weightKg: number

): number {
  
  let met = 6;
  if (avgSpeedKmh >= 25) met = 10;
  else if (avgSpeedKmh >= 20) met = 9;
  else if (avgSpeedKmh >= 16) met = 8;
  else if (avgSpeedKmh >= 12) met = 7;

  // kcal = MET × weight(kg) × duration(h)
  return Math.round(met * weightKg * (durationSeconds / 3600));
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useRideTracker() {
  const [state, setState] = useState<RideState>({
    status: 'idle',
    rideId: null,
    elapsed: 0,
    distance: 0,
    speed: 0,
    calories: 0,
    route: [],
    finishedRide: null,
    error: null,
    weight: 70
  });

  // Internal refs (don't need to trigger renders)
  const watchIdRef   = useRef<number | null>(null);
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeRef     = useRef<RoutePoint[]>([]);
  const elapsedRef   = useRef<number>(0);
  const distanceRef  = useRef<number>(0);
  const weightRef    = useRef<number>(70); // ref so GPS callback always reads latest weight

  // ── Timer ──────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setState((s) => ({ ...s, elapsed: elapsedRef.current }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── GPS watch ──────────────────────────────────────────────────────────

  const startGPS = useCallback(() => {
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, speed } = pos.coords;
        const newPoint: RoutePoint = { lat, lng };

        // Calculate incremental distance
        const prev = routeRef.current[routeRef.current.length - 1];
        if (prev) {
          const delta = haversineKm(prev.lat, prev.lng, lat, lng);
          // Filter out GPS noise: only add points that move > 3 m
          if (delta > 0.003) {
            distanceRef.current += delta;
            routeRef.current.push(newPoint);
          }
        } else {
          routeRef.current.push(newPoint);
        }

        const currentSpeedKmh = speed ? speed * 3.6 : 0;

        setState((s) => ({
          ...s,
          route: [...routeRef.current],
          distance: parseFloat(distanceRef.current.toFixed(3)),
          speed: parseFloat(currentSpeedKmh.toFixed(1)),
          calories: estimateCalories(
            elapsedRef.current,
            distanceRef.current > 0
              ? (distanceRef.current / (elapsedRef.current / 3600))
              : 0,
            weightRef.current
          ),
        }));
      },
      (err) => {
        console.warn('GPS error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      },
    );
  }, []);

  const stopGPS = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // ── Start ride ─────────────────────────────────────────────────────────

  const startRide = useCallback(async (name?: string) => {
    setState((s) => ({ ...s, status: 'starting', error: null }));

    try {
      const res = await apiStartRide(name);

      // Reset refs
      routeRef.current  = [];
      elapsedRef.current = 0;
      distanceRef.current = 0;

      setState((s) => ({
        ...s,
        status: 'tracking',
        rideId: res.ride_id,
        elapsed: 0,
        distance: 0,
        speed: 0,
        calories: 0,
        route: [],
        finishedRide: null,
      }));

      startTimer();
      startGPS();
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to start ride',
      }));
    }
  }, [startTimer, startGPS]);

  // ── Finish ride ────────────────────────────────────────────────────────

  const finishRide = useCallback(async () => {
    const { rideId } = state;
    if (!rideId) return;

    stopTimer();
    stopGPS();

    setState((s) => ({ ...s, status: 'finishing' }));

    try {
      const avgSpeed =
        distanceRef.current > 0 && elapsedRef.current > 0
          ? distanceRef.current / (elapsedRef.current / 3600)
          : 0;

      const res = await apiFinishRide(rideId, {
        distance: parseFloat(distanceRef.current.toFixed(3)),
        duration: elapsedRef.current,
        calories: estimateCalories(elapsedRef.current, avgSpeed, state.weight),
        route: routeRef.current,
      });

      setState((s) => ({
        ...s,
        status: 'done',
        finishedRide: res.ride,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to save ride',
      }));
    }
  }, [state, stopTimer, stopGPS]);

  // ── Reset ──────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    stopTimer();
    stopGPS();
    routeRef.current   = [];
    elapsedRef.current = 0;
    distanceRef.current = 0;
    setState((s) => ({
      ...s,
      status: 'idle',
      rideId: null,
      elapsed: 0,
      distance: 0,
      speed: 0,
      calories: 0,
      route: [],
      finishedRide: null,
      error: null,
    }));
  }, [stopTimer, stopGPS]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────

  useEffect(() => {
    async function fetchuser() {
        try {
            const user = await getUserProfile();
            const w = user.weight ?? 70;
            weightRef.current = w;
            setState((s) => ({ ...s, weight: w }));
        } catch (err) {
            console.error("Failed to fetch user profile for weight:", err);
        }
    }

    fetchuser();

    return () => {
      stopTimer();
      stopGPS();
    };
  }, [stopTimer, stopGPS]);

  // ── Derived: formatted elapsed ─────────────────────────────────────────

  const formatElapsed = (secs: number): string => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    ...state,
    startRide,
    finishRide,
    reset,
    formattedElapsed: formatElapsed(state.elapsed),
    isTracking: state.status === 'tracking',
  };
}