import { create } from 'zustand';
import type { SensorPayload, ActiveHelmet, Ride } from '@/types';

interface SensorState {
  // Realtime sensor data from BLE
  sensorData: SensorPayload | null;

  // Helmet connection
  activeHelmet: ActiveHelmet | null;
  isConnecting: boolean;

  // Active ride
  activeRide: Ride | null;
  isRideActive: boolean;

  // Computed ride stats (calculated on frontend)
  currentSpeed: number;
  totalDistance: number;
  routePoints: [number, number][];

  // Actions
  setSensorData: (data: SensorPayload) => void;
  setActiveHelmet: (helmet: ActiveHelmet | null) => void;
  setIsConnecting: (v: boolean) => void;
  setActiveRide: (ride: Ride | null) => void;
  addRoutePoint: (lat: number, lon: number) => void;
  setCurrentSpeed: (speed: number) => void;
  setTotalDistance: (dist: number) => void;
  resetRideStats: () => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  sensorData: null,
  activeHelmet: null,
  isConnecting: false,
  activeRide: null,
  isRideActive: false,
  currentSpeed: 0,
  totalDistance: 0,
  routePoints: [],

  setSensorData: (data) => set({ sensorData: data }),

  setActiveHelmet: (helmet) => set({ activeHelmet: helmet }),

  setIsConnecting: (v) => set({ isConnecting: v }),

  setActiveRide: (ride) =>
    set({ activeRide: ride, isRideActive: ride?.status === 'active' }),

  addRoutePoint: (lat, lon) =>
    set((state) => ({
      routePoints: [...state.routePoints, [lat, lon]],
    })),

  setCurrentSpeed: (speed) => set({ currentSpeed: speed }),

  setTotalDistance: (dist) => set({ totalDistance: dist }),

  resetRideStats: () =>
    set({
      currentSpeed: 0,
      totalDistance: 0,
      routePoints: [],
    }),
}));