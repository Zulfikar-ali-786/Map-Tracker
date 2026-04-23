"use client";

import { Car, Bus, Train, Bike, TreePine, Clock, Route } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmissionsPanel({ distance, duration, emissions }) {
  const hours = Math.floor(duration / 60);
  const minutes = Math.round(duration % 60);
  const timeString =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  return (
    <div className="space-y-4">
      {/* Distance & Duration */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-eco-green-light border-border py-0 gap-0">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Route className="h-5 w-5 text-primary mb-1.5" />
            <p className="text-xs text-muted-foreground font-medium">Total Distance</p>
            <p className="text-xl font-bold text-foreground font-mono">
              {distance.toFixed(1)}
              <span className="text-sm font-normal ml-1">km</span>
            </p>
          </CardContent>
        </Card>
        <Card className="bg-eco-green-light border-border py-0 gap-0">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Clock className="h-5 w-5 text-primary mb-1.5" />
            <p className="text-xs text-muted-foreground font-medium">Est. Duration</p>
            <p className="text-xl font-bold text-foreground font-mono">{timeString}</p>
          </CardContent>
        </Card>
      </div>

      {/* Carbon Footprint */}
      <Card className="border-border py-0 gap-0">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <TreePine className="h-4 w-4 text-primary" />
            Carbon Footprint Estimate
          </h3>
          <div className="space-y-3">
            <EmissionRow
              icon={<Car className="h-4 w-4" />}
              label="Car"
              value={emissions.car}
              maxValue={emissions.car}
              color="bg-destructive/80"
            />
            <EmissionRow
              icon={<Bus className="h-4 w-4" />}
              label="Bus"
              value={emissions.bus}
              maxValue={emissions.car}
              color="bg-chart-4"
            />
            <EmissionRow
              icon={<Train className="h-4 w-4" />}
              label="Train"
              value={emissions.train}
              maxValue={emissions.car}
              color="bg-primary"
            />
            <EmissionRow
              icon={<Bike className="h-4 w-4" />}
              label="Bicycle"
              value={emissions.cycle}
              maxValue={emissions.car}
              color="bg-eco-emerald"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trees Offset */}
      <Card className="bg-primary border-primary py-0 gap-0">
        <CardContent className="p-4 text-center text-primary-foreground">
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: Math.min(emissions.treesNeeded, 5) }).map((_, i) => (
              <TreePine key={i} className="h-5 w-5" />
            ))}
          </div>
          <p className="text-sm font-medium">
            <span className="text-2xl font-bold font-mono">{emissions.treesNeeded}</span>
          </p>
          <p className="text-xs opacity-90">
            {"tree(s) needed per year to offset this trip's CO\u2082"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function EmissionRow({ icon, label, value, maxValue, color }) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono font-semibold text-foreground">
          {value.toFixed(2)} <span className="text-xs text-muted-foreground">kg CO&#8322;</span>
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${Math.max(percentage, value === 0 ? 0 : 3)}%` }}
        />
      </div>
    </div>
  );
}
