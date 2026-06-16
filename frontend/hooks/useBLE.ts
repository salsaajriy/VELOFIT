'use client';

import { useCallback } from 'react';
import { bleService } from '@/services/bleService';
import { api } from '@/services/api';
import { useSensorStore } from '@/store/sensorStore';
import type { ActiveHelmet } from '@/types';

export function useBLE() {
  const { setActiveHelmet, setIsConnecting, setSensorData, isConnecting, activeHelmet } =
    useSensorStore();

  const connect = useCallback(async (): Promise<void> => {
    setIsConnecting(true);
    try {
      const { device, characteristic } = await bleService.connect();

      // Validate that device belongs to user's registered helmets
      const deviceName = device.name ?? '';
      const res = await api.validateHelmetConnection(deviceName);

      if (!res.valid || !res.data) {
        bleService.disconnect();
        throw new Error(res.message);
      }

      const active: ActiveHelmet = { helmet: res.data, device, characteristic };
      setActiveHelmet(active);

      // Start streaming sensor data into global store
      await bleService.startNotifications((data) => {
        setSensorData(data);
      });
    } finally {
      setIsConnecting(false);
    }
  }, [setActiveHelmet, setIsConnecting, setSensorData]);

  const disconnect = useCallback(async (): Promise<void> => {
    await bleService.stopNotifications();
    bleService.disconnect();
    setActiveHelmet(null);
  }, [setActiveHelmet]);

  const cancelAlert = useCallback(async (): Promise<void> => {
    await bleService.writeCommand('CANCEL');
  }, []);

  return {
    connect,
    disconnect,
    cancelAlert,
    isConnecting,
    isConnected: activeHelmet !== null,
    activeHelmet,
  };
}