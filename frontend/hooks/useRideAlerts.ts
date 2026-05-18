'use client';
 
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
 
interface Alert {
  id:      number;
  type:    string;
  message: string;
}
 
export function useRideAlerts(rideId: number | null, isActive: boolean) {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAlertId = useRef<number>(0);
 
  useEffect(() => {
    if (!rideId || !isActive) return;
 
    const poll = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/rides/${rideId}`,
          { withCredentials: true }
        );
        const newAlerts: Alert[] = data.data.alerts ?? [];
        const fresh = newAlerts.filter((a) => a.id > lastAlertId.current);
        if (fresh.length > 0) {
          lastAlertId.current = Math.max(...fresh.map((a) => a.id));
          setLatestAlert(fresh[fresh.length - 1]);
          setAlerts((prev) => [...prev, ...fresh]);
        }
      } catch { /* silent */ }
    };
 
    poll();
    intervalRef.current = setInterval(poll, 5_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [rideId, isActive]);
 
  const dismissAlert = () => setLatestAlert(null);
 
  return { alerts, latestAlert, dismissAlert };
}
