'use client';
 
import { useState, useRef, useCallback, useEffect } from 'react';
import { haversineDistance } from '@/lib/haversine';
import { rideService } from '@/services/rideService';
import type { RideStatus, RideMode, RidePoint, RideStats, ActiveRide } from '@/types/ride';
 
// ── Konstanta ────────────────────────────────────────────────
const NOISE_THRESHOLD_M    = 3;      // Abaikan gerakan < 3 meter
const BATCH_SIZE           = 5;      // Kirim ke API setiap 5 titik
const BATCH_INTERVAL_MS    = 10_000; // Atau setiap 10 detik
const MET_CYCLING          = 8.0;
const USER_WEIGHT_KG       = 70;     // Ambil dari profil user existing
 
// ── Types ────────────────────────────────────────────────────
interface UseRideTrackerReturn {
  status:      RideStatus;
  stats:       RideStats;
  currentPos:  { lat: number; lng: number } | null;
  trail:       Array<[number, number]>;  // untuk Leaflet polyline
  activeRide:  ActiveRide | null;
  elapsedTime: number; // detik
  startRide:   (mode: RideMode) => Promise<void>;
  pauseRide:   () => Promise<void>;
  resumeRide:  () => Promise<void>;
  finishRide:  () => Promise<void>;
  error:       string | null;
}
 
// ── Hook ─────────────────────────────────────────────────────
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
 
  // Refs — tidak perlu re-render saat berubah
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
 
  // ── Cleanup ──────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (batchTimerRef.current) { clearInterval(batchTimerRef.current); batchTimerRef.current = null; }
  }, []);
 
  useEffect(() => () => cleanup(), [cleanup]);
 
  // ── Kalori ───────────────────────────────────────────────
  const calcCalories = (durationSec: number) =>
    Math.round(MET_CYCLING * USER_WEIGHT_KG * (durationSec / 3600) * 10) / 10;
 
  // ── Flush batch GPS ke API ───────────────────────────────
  const flushBatch = useCallback(async () => {
    if (!locationBatch.current.length || !activeRide) return;
    const toSend = [...locationBatch.current];
    locationBatch.current = [];
    try {
      await rideService.sendLocations(toSend);
    } catch {
      // Simpan kembali jika gagal — retry di flush berikutnya
      locationBatch.current = [...toSend, ...locationBatch.current];
    }
  }, [activeRide]);
 
  // ── GPS Position Handler ─────────────────────────────────
  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const { latitude, longitude, speed } = pos.coords;
    const timestamp = pos.timestamp;
    const speedKmh  = speed ? speed * 3.6 : 0;
 
    // Update posisi saat ini
    setCurrentPos({ lat: latitude, lng: longitude });
 
    // Noise filter
    if (lastPointRef.current) {
      const distM = haversineDistance(
        lastPointRef.current.lat, lastPointRef.current.lng,
        latitude, longitude
      ) * 1000;
 
      if (distM < NOISE_THRESHOLD_M) return; // Abaikan
    }
 
    // Hitung jarak
    if (lastPointRef.current) {
      const distKm = haversineDistance(
        lastPointRef.current.lat, lastPointRef.current.lng,
        latitude, longitude
      );
      totalDistance.current += distKm;
    }
 
    // Update max speed
    if (speedKmh > maxSpeedRef.current) maxSpeedRef.current = speedKmh;
    speedHistory.current.push(speedKmh);
 
    const newPoint: RidePoint = { lat: latitude, lng: longitude, speed: speedKmh, timestamp };
    lastPointRef.current = newPoint;
    locationBatch.current.push(newPoint);
 
    // Update trail untuk map
    setTrail((prev) => [...prev, [latitude, longitude]]);
 
    // Auto-flush jika batch sudah cukup besar
    if (locationBatch.current.length >= BATCH_SIZE) flushBatch();
 
    // Update stats (kalkulasi lokal, tidak tunggu API)
    setStats((prev) => {
      const avgSpeed =
        speedHistory.current.length > 0
          ? speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length
          : 0;
      return {
        distance:  Math.round(totalDistance.current * 1000) / 1000,
        duration:  prev.duration,
        avgSpeed:  Math.round(avgSpeed * 10) / 10,
        maxSpeed:  Math.round(maxSpeedRef.current * 10) / 10,
        calories:  calcCalories(prev.duration),
      };
    });
  }, [flushBatch]);
 
  // ── GPS Error Handler ────────────────────────────────────
  const handleGpsError = useCallback((err: GeolocationPositionError) => {
    setError(`GPS Error: ${err.message}`);
  }, []);
 
  // ── Timer ────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    segmentStart.current = Date.now();
    timerRef.current = setInterval(() => {
      const segmentElapsed = Math.floor((Date.now() - segmentStart.current) / 1000);
      const total = pausedDuration.current + segmentElapsed;
      setElapsedTime(total);
      setStats((prev) => ({ ...prev, duration: total, calories: calcCalories(total) }));
    }, 1000);
  }, []);
 
  // ── Start Ride ───────────────────────────────────────────
  const startRide = useCallback(async (mode: RideMode) => {
    setError(null);
    setStatus('starting');
 
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung Geolocation.');
      setStatus('idle');
      return;
    }
 
    try {
      const ride = await rideService.startRide(mode);
      setActiveRide({ id: ride.id, mode, status: 'active', startedAt: ride.startedAt });
      setStatus('tracking');
 
      // Mulai GPS watch
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleGpsError,
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1_000 }
      );
 
      // Mulai timer
      startTimer();
 
      // Batch timer — flush setiap BATCH_INTERVAL_MS
      batchTimerRef.current = setInterval(flushBatch, BATCH_INTERVAL_MS);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Gagal memulai ride.');
      setStatus('idle');
    }
  }, [handlePosition, handleGpsError, startTimer, flushBatch]);
 
  // ── Pause Ride ───────────────────────────────────────────
  const pauseRide = useCallback(async () => {
    if (!activeRide || status !== 'tracking') return;
 
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
 
    // Catat waktu yang sudah berjalan sebelum pause
    pausedDuration.current = elapsedTime;
    await flushBatch(); // Kirim sisa batch
 
    await rideService.pauseRide(activeRide.id);
    setStatus('paused');
  }, [activeRide, status, elapsedTime, flushBatch]);
 
  // ── Resume Ride ──────────────────────────────────────────
  const resumeRide = useCallback(async () => {
    if (!activeRide || status !== 'paused') return;
 
    await rideService.resumeRide(activeRide.id);
    setStatus('tracking');
 
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition, handleGpsError,
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 1_000 }
    );
 
    startTimer();
    batchTimerRef.current = setInterval(flushBatch, BATCH_INTERVAL_MS);
  }, [activeRide, status, handlePosition, handleGpsError, startTimer, flushBatch]);
 
  // ── Finish Ride ──────────────────────────────────────────
  const finishRide = useCallback(async () => {
    if (!activeRide) return;
 
    setStatus('finishing');
    cleanup();
    await flushBatch(); // Kirim sisa lokasi
 
    const avgSpeed =
      speedHistory.current.length > 0
        ? speedHistory.current.reduce((a, b) => a + b, 0) / speedHistory.current.length
        : 0;
 
    const finalStats: RideStats = {
      distance:  Math.round(totalDistance.current * 1000) / 1000,
      duration:  elapsedTime,
      avgSpeed:  Math.round(avgSpeed * 10) / 10,
      maxSpeed:  Math.round(maxSpeedRef.current * 10) / 10,
      calories:  calcCalories(elapsedTime),
    };
 
    await rideService.finishRide(activeRide.id, finalStats);
    setStats(finalStats);
    setStatus('completed');
  }, [activeRide, elapsedTime, cleanup, flushBatch]);
 
  return {
    status, stats, currentPos, trail, activeRide,
    elapsedTime, startRide, pauseRide, resumeRide, finishRide, error,
  };
}
