"use client";

import { useState, useCallback } from "react";
import {
  Navigation,
  MapPinned,
  Flag,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationInput } from "@/components/location-input";
import { EmissionsPanel } from "@/components/emissions-panel";
import { RouteMap } from "@/components/route-map";
import { AppHeader } from "@/components/app-header";

export function RouteFinder() {
  const [startPoint, setStartPoint] = useState(null);
  const [intermediatePoint, setIntermediatePoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const allPointsSet = startPoint && intermediatePoint && destinationPoint;

  const markers = [
    ...(startPoint
      ? [
          {
            position: [startPoint.lat, startPoint.lon],
            label: startPoint.displayName.split(",")[0],
            type: "start",
          },
        ]
      : []),
    ...(intermediatePoint
      ? [
          {
            position: [intermediatePoint.lat, intermediatePoint.lon],
            label: intermediatePoint.displayName.split(",")[0],
            type: "intermediate",
          },
        ]
      : []),
    ...(destinationPoint
      ? [
          {
            position: [destinationPoint.lat, destinationPoint.lon],
            label: destinationPoint.displayName.split(",")[0],
            type: "destination",
          },
        ]
      : []),
  ];

  const calculateRoute = useCallback(async () => {
    if (!startPoint || !intermediatePoint || !destinationPoint) return;

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch("/api/route-calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waypoints: [
            { lat: startPoint.lat, lon: startPoint.lon },
            { lat: intermediatePoint.lat, lon: intermediatePoint.lon },
            { lat: destinationPoint.lat, lon: destinationPoint.lon },
          ],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to calculate route");
      }

      const data = await response.json();
      setRouteData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsCalculating(false);
    }
  }, [startPoint, intermediatePoint, destinationPoint]);

  const handleReset = () => {
    setStartPoint(null);
    setIntermediatePoint(null);
    setDestinationPoint(null);
    setRouteData(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-[420px] bg-card border-r border-border flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5 flex-1">
            {/* Location Inputs */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Route Waypoints
              </h2>

              <LocationInput
                label="Starting Point"
                placeholder="Enter starting location..."
                value={startPoint}
                onChange={setStartPoint}
                icon={<Navigation className="h-4 w-4 text-green-600" />}
              />

              <LocationInput
                label="Intermediate Stop"
                placeholder="Enter intermediate location..."
                value={intermediatePoint}
                onChange={setIntermediatePoint}
                icon={<MapPinned className="h-4 w-4 text-amber-500" />}
              />

              <LocationInput
                label="Destination"
                placeholder="Enter destination..."
                value={destinationPoint}
                onChange={setDestinationPoint}
                icon={<Flag className="h-4 w-4 text-red-500" />}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={calculateRoute}
                disabled={!allPointsSet || isCalculating}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4 mr-2" />
                    Find Route
                  </>
                )}
              </Button>
              {(routeData || startPoint || intermediatePoint || destinationPoint) && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Reset</span>
                </Button>
              )}
            </div>

            {/* Results */}
            {routeData && (
              <div className="pt-2">
                <EmissionsPanel
                  distance={routeData.distance}
                  duration={routeData.duration}
                  emissions={routeData.emissions}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Routes via OSRM &middot; Maps by OpenStreetMap &middot; Geocoding
              by Nominatim
              <br />
              {"CO\u2082 estimates: Car 120g/km \u00B7 Bus 68g/km \u00B7 Train 41g/km"}
            </p>
          </div>
        </aside>

        {/* Map Area */}
        <main className="hidden lg:flex flex-1 p-3">
          <RouteMap
            routeCoordinates={routeData?.coordinates ?? null}
            markers={markers}
          />
        </main>
      </div>

      {/* Mobile Map (below sidebar on small screens) */}
      <div className="lg:hidden flex-1 min-h-[400px] p-3">
        <RouteMap
          routeCoordinates={routeData?.coordinates ?? null}
          markers={markers}
        />
      </div>
    </div>
  );
}
