"use client";

import { Leaf, Github } from "lucide-react";

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
          <Leaf className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight tracking-tight text-balance">
            Eco Route Finder
          </h1>
          <p className="text-xs text-muted-foreground">
            Green route planning with carbon estimation
          </p>
        </div>
      </div>
      <a
        href="https://www.openstreetmap.org"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Github className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Powered by OSM</span>
      </a>
    </header>
  );
}
