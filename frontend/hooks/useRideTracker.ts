'use client';
 
import { useState, useRef, useCallback, useEffect } from 'react';
import { haversineDistance } from '@/lib/haversine';
import { rideService } from '@/services/rideService';
import type { RideStatus, RideMode, RidePoint, RideStats, ActiveRide } from '@/types/ride';
import { helmetService } from '@/services/helmetService';
 
const NOISE_THRESHOLD_M    = 2;     
const BATCH_SIZE           = 5;     
const BATCH_INTERVAL_MS    = 10_000;  
 
interface UseRideTrackerReturn {
  status:      RideStatus;
  stats:       RideStats;
  currentPos:  { lat: number; lng: number } | null;
  trail:       Array<[number, number]>;  
  activeRide:  ActiveRide | null;
  elapsedTime: number; 
  startRide:   (mode: RideMode) => Promise<void>;
  pauseRide:   () => Promise<void>;
  resumeRide:  () => Promise<void>;
  finishRide:  () => Promise<void>;
  error:       string | null;
}
 
export function useRideTracker(): UseRideTrackerReturn {
  const [status, setStatus]       = useState<RideStatus>('idle');
  const [error, setError]         = useState<string | null>(null);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [trail, setTrail]         = useState<Array<[number, number]>>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats]         = useState<RideStats>({
    distance: 0, duration: 0, avgSpeed: 0, maxSpeed: 0, calories: 0,
  });
 
  const watchIdRef      = useRef<number | null>(null);
  const timerRef        = useRef<NodeJS.Timeout | null>(null);
  const batchTimerRef   = useRef<NodeJS.Timeout | null>(null);
  const locationBatch   = useRef<RidePoint[]>([]);
  const lastPointRef    = useRef<RidePoint | null>(null);
  const pausedDuration  = useRef(0);
  const segmentStart    = useRef<number>(0);
  const totalDistance   = useRef(0);
  const maxSpeedRef     = useRef(0);
  const speedHistory    = useRef<number[]>([]);
 
  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (batchTimerRef.current) { clearInterval(batchTimerRef.current); batchTimerRef.current = null; }
  }, []);

  const loadActiveRide = useCallback(async () => {
    try {
      const ride = await rideService.getActiveRide();

      if (!ride) return;

      setActiveRide(ride);
      setStats({
        distance: ride.distance ?? 0,
        duration: ride.duration ?? 0,
        avgSpeed: ride.avg_speed ?? 0,
        maxSpeed: ride.max_speed ?? 0,
        calories: ride.calories ?? 0,
      });

      totalDistance.current = ride.distance ?? 0;
      maxSpeedRef.current = ride.max_speed ?? 0;

      setElapsedTime(ride.duration ?? 0);
      pausedDuration.current = ride.duration ?? 0;

      if (ride.status === 'paused') {
        setStatus('paused');
      } else {
        setStatus('tracking');
      }
    } catch {
    }
  }, []);
 
  
  useEffect(() => {
    const init = async () => {
      await loadActiveRide();
    };

    init();

    return () => cleanup();
  }, [cleanup, loadActiveRide]);
 
  const flushBatch = useCallback(async () => {
    if (!locationBatch.current.length || !activeRide) return;
    const toSend = [...locationBatch.current];
    locationBatch.current = [];
    try {
      await rideService.sendLocations(toSend);
    } catch {
      locationBatch.current = [...toSend, ...locationBatch.current];
    }
  }, [activeRide]);
 
  const handlePosition = useCallback((pos: GeolocationPosition) => {
  const {
    latitude,
    longitude,
    speed,
    accuracy,
  } = pos.coords;

  const timestamp = pos.timestamp;
  const speedKmh = speed ? speed * 3.6 : 0;
    
  console.log(
      latitude,
      longitude,
      accuracy,
      timestamp
    );

  setCurrentPos({ lat: latitude, lng: longitude });

  if (!lastPointRef.current) {
    const firstPoint: RidePoint = {
      lat: latitude,
      lng: longitude,
      speed: speedKmh,
      timestamp,
    };

        console.log(
        'GPS ACCEPTED', latitude, longitude, accuracy
    );

    lastPointRef.current = firstPoint;
    locationBatch.current.push(firstPoint);

    setTrail([[latitude, longitude]]);

    speedHistory.current.push(speedKmh);

    console.log({
      lat: latitude,
      lng: longitude,
      accuracy,
      speedKmh,
    });
    
    return;
  }

  if (accuracy > 500) {
    return;
  }

  const distM =
    haversineDistance(
      lastPointRef.current.lat,
      lastPointRef.current.lng,
      latitude,
      longitude
    ) * 1000;

  if (distM < NOISE_THRESHOLD_M) {
    return;
  }

  // if (speedKmh < 1 && distM < 15) {
  //   return;
  // }

  totalDistance.current += distM / 1000;

  if (speedKmh > maxSpeedRef.current) {
    maxSpeedRef.current = speedKmh;
  }

  speedHistory.current.push(speedKmh);

  const newPoint: RidePoint = {
    lat: latitude,
    lng: longitude,
    speed: speedKmh,
    timestamp,
  };

  lastPointRef.current = newPoint;
  locationBatch.current.push(newPoint);

  setTrail((prev) => [...prev, [latitude, longitude]]);

  if (locationBatch.current.length >= BATCH_SIZE) {
    flushBatch();
  }

  setStats((prev) => {
    const avgSpeed =
      speedHistory.current.length > 0
        ? speedHistory.current.reduce((a, b) => a + b, 0) /
          speedHistory.current.length
        : 0;

    return {
      distance: Math.round(totalDistance.current * 1000) / 1000,
      duration: prev.duration,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeedRef.current * 10) / 10,
      calories: prev.calories,
    };
  });
}, [flushBatch]);
 
  const handleGpsError = useCallback((err: GeolocationPositionError) => {
    setError(`GPS Error: ${err.message}`);
  }, []);

  const startTimer = useCallback(() => {
    segmentStart.current = Date.now();
    timerRef.current = setInterval(() => {
      const segmentElapsed = Math.floor((Date.now() - segmentStart.current) / 1000);
      const total = pausedDuration.current + segmentElapsed;
      setElapsedTime(total);
      setStats((prev) => ({ ...prev, duration: total, calories: 0 }));
    }, 1000);
  }, []);


  const startRide = useCallback(async (mode: RideMode) => {
    setError(null);
    setStatus('starting');
 
    if (!navigator.geolocation) {
      setError('Browser does not support Geolocation.');
      setStatus('idle');
      return;
    }
 
    try {
      const helmetId = await helmetService.getActiveHelmetId();
      
      if (!helmetId) {
        throw new Error('No helmet selected. Please select a helmet before starting a ride.');
      }

      console.log('🚀 Starting ride with helmet ID:', helmetId);

      const ride = await rideService.startRide(Number(helmetId), mode);
      setActiveRide({ id: ride.id, mode, status: 'starting', distance: 0, duration: 0, avg_speed: 0, max_speed: 0, calories: 0, started_at: ride.started_at });
      setStatus('tracking');
 
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleGpsError,
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1_000 }
      );

      startTimer();
 
      batchTimerRef.current = setInterval(flushBatch, BATCH_INTERVAL_MS);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to start ride.');
      setStatus('idle');
    }
  }, [handlePosition, handleGpsError, startTimer, flushBatch]);
 

  const pauseRide = useCallback(async () => {
    if (!activeRide || status !== 'tracking') return;
 
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
 
    pausedDuration.current = elapsedTime;
    await flushBatch(); 
 
    // await rideService.pauseRide(activeRide.id);
    setStatus('paused');
  }, [activeRide, status, elapsedTime, flushBatch]);
 

  const resumeRide = useCallback(async () => {
    if (!activeRide || status !== 'paused') return;
 
    // await rideService.resumeRide(activeRide.id);
    setStatus('tracking');
 
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition, handleGpsError,
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1_000 }
    );
 
    startTimer();
    batchTimerRef.current = setInterval(flushBatch, BATCH_INTERVAL_MS);
  }, [activeRide, status, handlePosition, handleGpsError, startTimer, flushBatch]);
 

  const finishRide = useCallback(async () => {
    if (!activeRide) return;
 
    setStatus('finishing');
    cleanup();
    await flushBatch(); 
 
    const avgSpeed =
      speedHistory.current.length > 0
        ? speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length
        : 0;
 
    const finalStats: RideStats = {
      distance:  Math.round(totalDistance.current * 1000) / 1000,
      duration:  elapsedTime,
      avgSpeed:  Math.round(avgSpeed * 10) / 10,
      maxSpeed:  Math.round(maxSpeedRef.current * 10) / 10,
      calories:  0,
    };
 
    console.log('FINAL STATS', finalStats);
    console.log('TOTAL DISTANCE REF', totalDistance.current);
    console.log('POINTS', locationBatch.current.length);

    const result = await rideService.finishRide(
      activeRide.id,
      finalStats
    );

    setStats({
      distance: result.distance,
      duration: result.duration,
      avgSpeed: result.avg_speed,
      maxSpeed: result.max_speed,
      calories: result.calories,
    });

    setStatus('completed');
  }, [activeRide, elapsedTime, cleanup, flushBatch]);
 
  return {
    status, stats, currentPos, trail, activeRide,
    elapsedTime, startRide, pauseRide, resumeRide, finishRide, error,
  };
}
