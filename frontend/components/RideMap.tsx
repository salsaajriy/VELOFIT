"use client";

import { useEffect, useRef } from "react";
import type { Map, Polyline } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  routePoints: [number, number][];
}

export default function RideMap({ routePoints }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const polylineRef = useRef<Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const initializeMap = async () => {
      const leafletModule = await import("leaflet");
      const L = leafletModule.default ?? leafletModule;

      const defaultCenter: [number, number] = routePoints[0] ?? [
        1.1288, 104.0051,
      ];
      mapRef.current = L.map(containerRef.current!).setView(defaultCenter, 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      polylineRef.current = L.polyline(routePoints, {
        color: "#f59e0b",
        weight: 4,
      }).addTo(mapRef.current);
    };

    initializeMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update polyline as new points arrive
  useEffect(() => {
    if (!polylineRef.current || !mapRef.current) return;
    polylineRef.current.setLatLngs(routePoints);
    if (routePoints.length > 0) {
      const last = routePoints[routePoints.length - 1];
      mapRef.current.setView(last, mapRef.current.getZoom());
    }
  }, [routePoints]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
