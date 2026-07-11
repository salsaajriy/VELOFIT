'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import { useSensorStore } from '@/store/sensorStore';

const SYNC_INTERVAL_MS = 4000; // sync every 4 seconds

export function useRide() {
  const {
    activeRide,
    activeHelmet,
    sensorData,
    isRideActive,
    setActiveRide,
    addRoutePoint,
    setCurrentSpeed,
    setTotalDistance,
    totalDistance,
    routePoints,
    resetRideStats,
  } = useSensorStore();

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPointRef    = useRef<[number, number] | null>(null);
  const emergencySentRef = useRef(false);
  const [duration, setDuration] = useState(0);

  const haversine = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  // Update route and speed whenever sensor data arrives
  useEffect(() => {
    if (!isRideActive || !sensorData?.gpsOk) return;
    const { lat, lon } = sensorData;

    if (lastPointRef.current) {
      const [prevLat, prevLon] = lastPointRef.current;
      const seg = haversine(prevLat, prevLon, lat, lon);
      setTotalDistance(totalDistance + seg);

      // Approximate speed: seg km over ~5s interval = * 720 for km/h
      const speed = seg * 720;
      setCurrentSpeed(Math.min(speed, 120)); // cap at 120 km/h for sanity
    }

    addRoutePoint(lat, lon);
    lastPointRef.current = [lat, lon];
  }, [sensorData, isRideActive, totalDistance, haversine, addRoutePoint, setCurrentSpeed, setTotalDistance]);

  useEffect(() => {
      if (!isRideActive || !sensorData || !activeRide) return;

      if (sensorData.alert === 2 && !emergencySentRef.current) {
          emergencySentRef.current = true;

          console.log("🚨 Crash detected. Sending emergency...");

          api.sendEmergency(activeRide.id)
              .then(() => {
                  console.log("✅ Emergency sent");
              })
              .catch((err) => {
                  console.error(err);
                  emergencySentRef.current = false;
              });
      }

      if (sensorData.alert === 0) {
          emergencySentRef.current = false;
      }
  }, [sensorData, activeRide, isRideActive]);

  useEffect(() => {
    if (!activeRide || !isRideActive) return;

    const startTime = new Date(activeRide.start_time).getTime();

    const updateDuration = () => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    };

    updateDuration();

    const timer = setInterval(updateDuration, 1000);

    return () => {
      clearInterval(timer);
      setDuration(0);
    };
  }, [activeRide, isRideActive]);

  const startRide = useCallback(async () => {
    if (!activeHelmet) throw new Error('No helmet connected.');
    resetRideStats();
    lastPointRef.current = null;

    const ride = await api.startRide(activeHelmet.helmet.id);
    setActiveRide(ride);
    console.log("Ride created:", ride);

    // Begin periodic sync
    syncIntervalRef.current = setInterval(async () => {
      const store = useSensorStore.getState();
      if (!store.sensorData || !store.activeRide) return;

      await api.storeSensorData(store.activeRide.id, {
        helmet_id: activeHelmet.helmet.id,
        ...store.sensorData,
      });
    }, SYNC_INTERVAL_MS);
  }, [activeHelmet, resetRideStats, setActiveRide]);

  const finishRide = useCallback(async () => {
    if (!activeRide) return;

    emergencySentRef.current = false;

    // Stop syncing
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }

    const ride = await api.finishRide(activeRide.id);
    setActiveRide(null);
    return ride;
  }, [activeRide, setActiveRide]);

  return {
    startRide,
    finishRide,
    activeRide,
    isRideActive,
    currentSpeed: useSensorStore.getState().currentSpeed,
    totalDistance,
    routePoints,
    duration,
  };
}