"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

export function RouteMap({ routeCoordinates, markers }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markerLayersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity =
        "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.integrity =
        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      script.crossOrigin = "";
      script.onload = () => {
        setIsLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    // India bounds: SW [6.5, 68.0] to NE [37.5, 97.5]
    const indiaBounds = L.latLngBounds(
      L.latLng(6.5, 68.0),
      L.latLng(37.5, 97.5)
    );

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      maxBounds: indiaBounds.pad(0.1),
      maxBoundsViscosity: 0.8,
      minZoom: 4,
    }).setView([22.5, 82.0], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLoaded]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = window.L;
    if (!L) return;

    // Clear existing markers
    markerLayersRef.current.forEach((m) => m.remove());
    markerLayersRef.current = [];

    const colorMap = {
      start: "#16a34a",
      intermediate: "#f59e0b",
      destination: "#dc2626",
    };

    const iconMap = {
      start: "A",
      intermediate: "B",
      destination: "C",
    };

    markers.forEach((marker) => {
      const color = colorMap[marker.type];
      const letter = iconMap[marker.type];
      const customIcon = L.divIcon({
        html: `<div style="
          background: ${color};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-family: system-ui, sans-serif;
        ">${letter}</div>`,
        className: "custom-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -20],
      });

      const m = L.marker(marker.position, { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div style="font-family: system-ui; padding: 4px;">
            <strong style="color: ${color};">${letter}: ${marker.label}</strong>
          </div>`
        );

      markerLayersRef.current.push(m);
    });

    // Fit bounds to markers if we have them
    if (markers.length > 0 && !routeCoordinates) {
      // Filter out invalid marker positions
      const validPositions = markers
        .map((m) => m.position)
        .filter(
          (pos) =>
            pos &&
            Array.isArray(pos) &&
            pos.length === 2 &&
            typeof pos[0] === "number" &&
            typeof pos[1] === "number" &&
            !isNaN(pos[0]) &&
            !isNaN(pos[1]) &&
            pos[0] !== 0 &&
            pos[1] !== 0 &&
            Math.abs(pos[0]) <= 90 &&
            Math.abs(pos[1]) <= 180
        );

      if (validPositions.length > 0) {
        const bounds = L.latLngBounds(validPositions);
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }
  }, [markers, isLoaded, routeCoordinates]);

  // Draw route
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = window.L;
    if (!L) return;

    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      // Draw shadow first for depth
      const shadow = L.polyline(routeCoordinates, {
        color: "#0a4a1a",
        weight: 10,
        opacity: 0.2,
        smoothFactor: 1,
      }).addTo(mapInstanceRef.current);

      // Draw the main bold green route
      const route = L.polyline(routeCoordinates, {
        color: "#16a34a",
        weight: 6,
        opacity: 0.9,
        smoothFactor: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(mapInstanceRef.current);

      routeLayerRef.current = route;

      // Fit bounds to route (with validation)
      const bounds = route.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60] });
      }

      return () => {
        shadow.remove();
      };
    }
  }, [routeCoordinates, isLoaded]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-border shadow-sm">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
    </div>
  );
}
