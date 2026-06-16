"use client";

import { useEffect, useRef } from "react";
import type { RideLocation } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  route: RideLocation[];
}

export default function RideDetailMap({ route }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || route.length === 0) return;

    const points: [number, number][] = route.map((r) => [r.lat, r.lon]);
    const map = L.map(containerRef.current);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const poly = L.polyline(points, { color: "#f59e0b", weight: 4 }).addTo(map);

    // Start marker
    L.marker(points[0], {
      icon: L.divIcon({
        className: "",
        html: '<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid white"></div>',
      }),
    })
      .addTo(map)
      .bindPopup("Start");

    // End marker
    L.marker(points[points.length - 1], {
      icon: L.divIcon({
        className: "",
        html: '<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid white"></div>',
      }),
    })
      .addTo(map)
      .bindPopup("End");

    map.fitBounds(poly.getBounds(), { padding: [20, 20] });

    return () => {
      map.remove();
    };
  }, [route]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
